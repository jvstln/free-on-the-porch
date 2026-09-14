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
	FeedListingsQueryOutputDto,
	ListingDetailDto,
	ListingDto,
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
import {
	buildFeedBlendScore,
	buildFeedKeysetWhere,
	resolveFeedOrder,
} from "./listing-feed";

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

		if (!data.location) {
			throw new BadRequestException(
				"Location coordinates are required to create a listing",
			);
		}

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

	// FTS + PostGIS feed. Returns the feed: AVAILABLE listings ordered by the
	// active mode (blend, newest, or FTS relevance), filtered by category/radius
	// and full-text search, with cursor-based keyset pagination. Ordering, cursor
	// shapes and the keyset clauses live in listing-feed.ts so they're defined
	// once.
	async findFeed(
		query: FeedListingsQueryOutputDto,
	): Promise<PaginatedResponse<ListingDto[]>> {
		// Reusable search point built once from the query coords.
		const pointSql = sql`ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography`;

		// Full-text query (only when a search term was provided).
		const tsquery = query.query
			? sql`websearch_to_tsquery('english', ${query.query})`
			: null;

		// Resolves the ordering mode + fragments for this request (also picks
		// the matching cursor guard).
		const order = resolveFeedOrder(query, tsquery, pointSql);

		const decodedCursor = query.cursor
			? decodeCursor(query.cursor, order.cursorGuard)
			: null;

		// Fetch limit + 1 to detect if a next page exists.
		const feedListings = await this.drizzle.db.query.listing.findMany({
			extras: {
				// Compute distance for each row so it can drive the UI badge.
				distanceMeters: (t) =>
					sql<number>`ST_Distance(${t.location}, ${pointSql})`,
				// Blend score (only displayed on the featured card, but cheap).
				feedScore: (t) => sql<number>`${buildFeedBlendScore(t, pointSql)}`,
				// Search relevance (null when not searching).
				matchRank: (t) =>
					sql<number>`ts_rank_cd(${t.searchVector}, ${tsquery ?? sql`NULL::tsquery`})`,
			},
			with: {
				user: {
					columns: publicUserSelectFields,
				},
				images: true,
				pendingClaims: true,
			},
			where: {
				// RAW escape hatch: mix typed conditions with raw PostGIS/FTS SQL.
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

					// Optional full-text match on title/description.
					if (tsquery) {
						whereConditions.push(sql`${t.searchVector} @@ ${tsquery}`);
					}

					// Keyset condition continuing past the last seen item; the
					// shape matches the active ordering mode.
					whereConditions.push(
						buildFeedKeysetWhere(decodedCursor, tsquery, pointSql, t),
					);

					return and(...whereConditions) ?? sql`true`;
				},
			},
			orderBy: order.orderBy,
			limit: query.limit + 1,
		});

		return buildResponse(feedListings, {
			type: "cursor",
			limit: query.limit,
			getCursor: (l) => order.getCursor(l),
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
		// Pre-flight checks outside the transaction. These catch obvious errors
		// fast without holding a lock. The listing row is re-read inside the
		// transaction with FOR UPDATE to guarantee the state hasn't changed.
		const preflight = await this.drizzle.db.query.listing.findFirst({
			where: { id: listingId },
			columns: { id: true, userId: true },
		});

		if (!preflight) {
			throw new NotFoundException("Listing not found");
		}

		if (preflight.userId === userId) {
			throw new BadRequestException("You cannot claim your own listing");
		}

		// Check for existing claim outside tx — the unique constraint on
		// (listingId, userId) would catch this at write time anyway, but
		// checking early gives a better error message.
		const existingClaim =
			await this.drizzle.db.query.listingClaimRequest.findFirst({
				where: { listingId: listingId, userId: userId },
				columns: { id: true },
			});

		if (existingClaim) {
			throw new ConflictException(
				"You have already requested to claim this listing",
			);
		}

		// Critical section: lock the listing row with FOR UPDATE, verify it's
		// still AVAILABLE, then perform all writes atomically. The lock ensures
		// concurrent claim attempts serialize — the second one will block until
		// the first commits, then re-read and fail the status check.
		const foundThread = await this.drizzle.db.transaction(async (tx) => {
			// Lock the listing row. `of: listing` scopes the lock to just this
			// table, avoiding unnecessary locks on referenced tables.
			const [foundListing] = await tx
				.select()
				.from(listing)
				.where(eq(listing.id, listingId))
				.for("update", { of: listing });

			if (!foundListing) {
				throw new NotFoundException("Listing not found");
			}

			if (foundListing.status !== "AVAILABLE") {
				throw new BadRequestException(
					"Listing is no longer available for claiming",
				);
			}

			// Reuse an existing LISTING thread if the current user is already
			// a member (prevents duplicate threads on repeat claims).
			let foundThread = await tx.query.thread.findFirst({
				where: {
					listingId,
					threadMembers: {
						userId,
					},
				},
			});

			if (!foundThread) {
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
