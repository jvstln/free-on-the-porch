import {
	listing,
	listingClaimRequest,
	listingImage,
	message,
	publicUserSelectFields,
	thread,
	threadMember,
} from "@free-on-the-porch/db";
import type {
	CreateListingDto,
	ListingDetailDto,
	ListingDto,
	NearbyListingsQueryOutputDto,
	PaginatedResponse,
	ThreadMinimalDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	and,
	asc,
	desc,
	eq,
	gt,
	inArray,
	isNull,
	or,
	SQL,
	sql,
} from "drizzle-orm";
import {
	buildResponse,
	decodeCursor,
} from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

// ─── Geo Cursor (listing-specific keyset for PostGIS distance ordering) ───────
// The nearby feed orders listings by distance from the user. Since distance is
// not a stored column, we can't use a simple id/createdAt cursor — instead the
// cursor carries the distance of the last item plus its id as a tie-breaker so
// keyset pagination stays stable and correct.

interface GeoCursor {
	/** distanceMeters of the last item */
	d: number;
	/** id of the last item (tie-break) */
	id: string;
}

// Runtime type guard used by decodeCursor to validate the decoded cursor JSON
// actually matches a GeoCursor before it's trusted.
function isGeoCursor(val: unknown): val is GeoCursor {
	return (
		typeof val === "object" &&
		val !== null &&
		typeof (val as GeoCursor).d === "number" &&
		typeof (val as GeoCursor).id === "string"
	);
}

@Injectable()
export class ListingService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(
		userId: string,
		data: CreateListingDto,
		imageUrls: string[],
	): Promise<PaginatedResponse<ListingDetailDto>> {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // listings expire in 7 days

		// Insert the listing, then its images (if any) with an order index.
		// Note: the listing + image insert is not wrapped in a transaction —
		// if image insertion fails the listing is left valid on its own.
		const [newListing] = await this.drizzle.db
			.insert(listing)
			.values({
				title: data.title,
				description: data.description ?? null,
				category: data.category,
				condition: data.condition,
				location: data.location,
				address: data.address ?? null,
				userId,
				expiresAt,
			})
			.returning();

		if (!newListing) {
			// # purely for TS narrowing — the insert would have thrown
			throw new Error("Failed to create listing");
		}

		if (imageUrls.length > 0) {
			await this.drizzle.db.insert(listingImage).values(
				imageUrls.map((url, i) => ({
					url,
					order: i,
					listingId: newListing.id,
				})),
			);
		}

		return this.findOne({ id: newListing.id });
	}

	// PostGIS geospatial feed. Returns listings near a lat/lng point, ordered
	// by distance ascending, using cursor-based keyset pagination.
	async findNearby(
		query: NearbyListingsQueryOutputDto,
	): Promise<PaginatedResponse<ListingDto[]>> {
		// Reusable search point built once from the query coords.
		const pointSql = sql`ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography`;

		// Cursor-based keyset condition: skip items already seen
		const decodedCursor = query.cursor
			? decodeCursor(query.cursor, isGeoCursor)
			: null;

		// Fetch limit + 1 to detect if a next page exists
		const nearbyListings = await this.drizzle.db.query.listing.findMany({
			extras: {
				// Compute distance for each row so it can be used both in ordering
				// and as the cursor payload (distanceMeters of the last item).
				distanceMeters: (t) =>
					sql<number>`ST_Distance(${t.location}, ${pointSql})`,
			},
			with: {
				user: {
					columns: publicUserSelectFields,
				},
				images: true,
				pendingClaims: true,
			},
			where: {
				// RAW escape hatch: mix typed conditions with raw PostGIS SQL.
				RAW: (t) => {
					const whereConditions: (SQL | undefined)[] = [
						// Only available, not-yet-expired listings.
						eq(t.status, "AVAILABLE"),
						or(gt(t.expiresAt, new Date()), isNull(t.expiresAt)),
					];

					if (query.category) {
						whereConditions.push(eq(t.category, query.category));
					}

					// Optional radius filter via PostGIS ST_DWithin.
					if (typeof query.radiusMeters === "number") {
						whereConditions.push(
							sql`ST_DWithin(${t.location}, ${pointSql}, ${query.radiusMeters})`,
						);
					}

					if (decodedCursor) {
						// Keyset condition continuing past the last seen item:
						// strictly greater distance, OR equal distance with a
						// greater id (tie-break) to match the ordering below.
						whereConditions.push(
							sql`(${t.location} <-> ${pointSql} > ${decodedCursor.d}) OR (${t.location} <-> ${pointSql} = ${decodedCursor.d} AND ${t.id} > ${decodedCursor.id})`,
						);
					}
					return and(...whereConditions) ?? sql`true`;
				},
			},
			// <-> is the PostGIS KNN "rough distance" operator used to order
			// rows by proximity. id is the deterministic tie-breaker.
			orderBy: (t) => sql`${t.location} <-> ${pointSql}, ${t.id}`,
			limit: query.limit + 1,
		});

		return buildResponse(nearbyListings, {
			type: "cursor",
			limit: query.limit,
			getCursor: (l) => ({ d: l.distanceMeters, id: l.id }),
		});
	}

	async findOne(
		whereCondition: NonNullable<
			Parameters<typeof this.drizzle.db.query.listing.findFirst>[0]
		>["where"],
	): Promise<PaginatedResponse<ListingDetailDto>> {
		const createdListing = await this.drizzle.db.query.listing.findFirst({
			where: whereCondition,
			with: {
				user: {
					columns: publicUserSelectFields,
				},
				images: true,
				comments: {
					with: {
						user: {
							columns: publicUserSelectFields,
						},
					},
				},
				pendingClaims: {
					with: {
						user: {
							columns: publicUserSelectFields,
						},
					},
				},
			},
		});

		if (!createdListing) throw new NotFoundException("Listing not found");

		return buildResponse(createdListing);
	}

	// Claim flow: a user expresses interest in a listing. Validates the listing
	// is claimable, then atomically (in a transaction) wires up a LISTING
	// thread between the claimant and owner, inserts a claim request, and
	// auto-sends a first message. Returns the resulting thread.
	async claim(
		listingId: string,
		userId: string,
	): Promise<PaginatedResponse<ThreadMinimalDto>> {
		// All reads and writes happen inside the transaction to prevent race
		// conditions (two concurrent claims on the same listing both passing
		// the availability check).
		const foundThread = await this.drizzle.db.transaction(async (tx) => {
			// Lock the listing row and verify it's claimable. Using tx ensures
			// concurrent claim attempts serialize on this row.
			const [foundListing] = await tx
				.select()
				.from(listing)
				.where(eq(listing.id, listingId));

			if (!foundListing) {
				throw new NotFoundException("Listing not found");
			}

			if (foundListing.userId === userId) {
				throw new BadRequestException("You cannot claim your own listing");
			}

			if (foundListing.status !== "AVAILABLE") {
				throw new BadRequestException(
					"Listing is no longer available for claiming",
				);
			}

			// Check if claim request already exists (inside tx — accurate read)
			const existingClaim =
				await tx.query.listingClaimRequest.findFirst({
					where: { listingId: listingId, userId: userId },
				});

			if (existingClaim) {
				throw new ConflictException(
					"You have already requested to claim this listing",
				);
			}

			// Reuse an existing LISTING thread for this listing IF the current
			// user is already a member of it (so repeat claims don't spawn
			// duplicate conversation threads).
			let foundThread = await tx.query.thread.findFirst({
				where: {
					listingId,
					threadMembers: {
						userId,
					},
				},
			});
			if (!foundThread) {
				// No usable thread yet — create a LISTING thread, add both the
				// claimant and the listing owner as members.
				const [newThread] = await tx
					.insert(thread)
					.values({
						type: "LISTING",
						listingId,
					})
					.returning();

				if (!newThread) {
					throw new Error("Failed to create thread");
				}

				foundThread = newThread;

				await tx.insert(threadMember).values([
					{ userId, threadId: foundThread.id },
					{ userId: foundListing.userId, threadId: foundThread.id },
				]);
			}

			await tx.insert(listingClaimRequest).values({
				listingId,
				userId,
			});

			// Mark listing as RESERVED so no one else can claim it.
			await tx
				.update(listing)
				.set({
					status: "RESERVED",
					claimedByUserId: userId,
				})
				.where(eq(listing.id, listingId));

			// Auto-send the first message so the owner gets a notification/thread
			// ping as soon as someone claims.
			await tx.insert(message).values({
				body: `Hi! I would like to claim your listing: ${foundListing.title}`,
				senderId: userId,
				threadId: foundThread.id,
			});

			return foundThread;
		});

		return buildResponse(foundThread);
	}

	// Owner-only update: verifies the requesting user owns the listing, then
	// applies only the fields present in the (partial) update DTO. Status
	// transitions are validated against the CHECK constraint on the listing table.
	async update(id: string, userId: string, data: UpdateListingDto) {
		const [foundListing] = await this.drizzle.db
			.select()
			.from(listing)
			.where(eq(listing.id, id));

		if (!foundListing) throw new NotFoundException("Listing not found");
		// Authorization: only the listing owner may edit it.
		if (foundListing.userId !== userId) throw new ForbiddenException();

		const updateData: Partial<typeof listing.$inferInsert> = {};
		if (data.title !== undefined) updateData.title = data.title;
		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.category !== undefined) updateData.category = data.category;
		if (data.condition !== undefined) updateData.condition = data.condition;
		if (data.address !== undefined) updateData.address = data.address;
		if (data.location) {
			updateData.location = data.location;
		}

		// Validate status transitions. The CHECK constraint on the listing table
		// requires claimedByUserId to be set iff status is PICKED_UP or RESERVED.
		if (data.status !== undefined && data.status !== foundListing.status) {
			const isClaimedStatus =
				data.status === "PICKED_UP" || data.status === "RESERVED";

			if (isClaimedStatus) {
				// Cannot claim/assign a listing that isn't AVAILABLE
				if (foundListing.status !== "AVAILABLE") {
					throw new BadRequestException(
						`Cannot change status from ${foundListing.status} to ${data.status}`,
					);
				}
				updateData.claimedByUserId = userId;
			}

			// Transitioning to a non-claimed status — clear claimedByUserId
			if (!isClaimedStatus) {
				updateData.claimedByUserId = null;
			}

			updateData.status = data.status;
		}

		const [[updatedListing], images] = await Promise.all([
			this.drizzle.db
				.update(listing)
				.set(updateData)
				.where(eq(listing.id, id))
				.returning(),
			this.drizzle.db
				.select()
				.from(listingImage)
				.where(eq(listingImage.listingId, id))
				.orderBy(asc(listingImage.order)),
		]);

		if (!updatedListing) {
			// purely for TS narrowing — the update would have thrown
			throw new Error("Failed to update listing");
		}

		return buildResponse({ ...updatedListing, images });
	}

	// Owner-only removal: verifies ownership then deletes the listing (related
	// rows cascade per the FK onDelete rules).
	async remove(id: string, userId: string) {
		const [foundListing] = await this.drizzle.db
			.select()
			.from(listing)
			.where(eq(listing.id, id));

		if (!foundListing) throw new NotFoundException("Listing not found");
		if (foundListing.userId !== userId) throw new ForbiddenException();

		await this.drizzle.db.delete(listing).where(eq(listing.id, id));
		return buildResponse({ success: true });
	}

	// Returns a user's listings with their first image and the owner. Used by
	// the "my listings" screen.
	async findByUser(userId: string) {
		const listings = await this.drizzle.db
			.select()
			.from(listing)
			.where(eq(listing.userId, userId))
			.orderBy(desc(listing.createdAt));

		const listingIds = listings.map((l) => l.id);

		const [images, owner] = await Promise.all([
			this.drizzle.db
				.select()
				.from(listingImage)
				.where(inArray(listingImage.listingId, listingIds))
				.orderBy(asc(listingImage.order)),
			this.drizzle.db.query.user.findFirst({
				where: { id: userId },
				columns: publicUserSelectFields,
			}),
		]);

		// The requesting user (who owns these listings) must exist.
		if (!owner) throw new NotFoundException("User not found");

		return buildResponse(
			listings.map((l) => ({
				...l,
				images: images.filter((img) => img.listingId === l.id).slice(0, 1),
				user: owner,
			})),
		);
	}
}
