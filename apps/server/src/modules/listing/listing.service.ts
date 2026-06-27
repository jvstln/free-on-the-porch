import {
	listing,
	listingClaimRequest,
	listingImage,
	message,
	publicUserColumns,
	thread,
	user,
} from "@free-on-the-porch/db";
import type {
	CreateListingDto,
	ListingDetailDto,
	ListingDto,
	NearbyListingsQueryOutputDto,
	PaginatedResponse,
	ThreadDto,
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

interface GeoCursor {
	/** distanceMeters of the last item */
	d: number;
	/** id of the last item (tie-break) */
	id: string;
}

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

		const [newListing] = await this.drizzle.db
			.insert(listing)
			.values({
				title: data.title,
				description: data.description ?? null,
				category: data.category,
				condition: data.condition,
				location: { lat: data.lat, lng: data.lng },
				address: data.address ?? null,
				userId,
				expiresAt,
			})
			.returning();

		if (!newListing) {
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

	async findNearby(
		query: NearbyListingsQueryOutputDto,
	): Promise<PaginatedResponse<ListingDto[]>> {
		const pointSql = sql`ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography`;

		// Cursor-based keyset condition: skip items already seen
		const decodedCursor = query.cursor
			? decodeCursor(query.cursor, isGeoCursor)
			: null;

		// Fetch limit + 1 to detect if a next page exists
		const rows = await this.drizzle.db.query.listing.findMany({
			extras: {
				distanceMeters: (t) =>
					sql<number>`ST_Distance(${t.location}, ${pointSql})`,
			},
			with: {
				user: {
					columns: publicUserColumns,
				},
				images: true,
				pendingClaims: true,
			},
			where: {
				RAW: (t) => {
					const whereConditions: (SQL | undefined)[] = [
						eq(t.status, "AVAILABLE"),
						or(gt(t.expiresAt, new Date()), isNull(t.expiresAt)),
					];

					if (query.category) {
						whereConditions.push(eq(t.category, query.category));
					}

					if (typeof query.radiusMeters === "number") {
						whereConditions.push(
							sql`ST_DWithin(${t.location}, ${pointSql}, ${query.radiusMeters})`,
						);
					}

					if (decodedCursor) {
						// Condition to filter everything that comes after cursor when ordering.. in PostGIS, <-> operator returns distance between two points
						whereConditions.push(
							sql`(${t.location} <-> ${pointSql} > ${decodedCursor.d}) OR (${t.location} <-> ${pointSql} = ${decodedCursor.d} AND ${t.id} > ${decodedCursor.id})`,
						);
					}
					return and(...whereConditions) ?? sql`true`;
				},
			},
			orderBy: (t) => sql`${t.location} <-> ${pointSql}, ${t.id}`,
			limit: query.limit + 1,
		});

		return buildResponse(rows, {
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
					columns: publicUserColumns,
				},
				images: true,
				comments: {
					with: {
						user: {
							columns: publicUserColumns,
						},
					},
				},
				pendingClaims: {
					with: {
						user: {
							columns: publicUserColumns,
						},
					},
				},
			},
		});

		if (!createdListing) throw new NotFoundException("Listing not found");

		return buildResponse(createdListing);
	}

	async claim(
		listingId: string,
		userId: string,
	): Promise<PaginatedResponse<ThreadDto>> {
		const foundListing = await this.drizzle.db.query.listing.findFirst({
			where: { id: listingId },
		});

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

		// Check if claim request already exists
		const existingClaim =
			await this.drizzle.db.query.listingClaimRequest.findFirst({
				where: { listingId: listingId, userId: userId },
			});

		if (existingClaim) {
			throw new ConflictException(
				"You have already requested to claim this listing",
			);
		}

		// Find existing thread or create new one
		// Insert claim request and auto-message owner in a transaction
		const foundThread = await this.drizzle.db.transaction(async (tx) => {
			let foundThread = await this.drizzle.db.query.thread.findFirst({
				where: {
					listingId,
					creatorId: userId,
					receiverId: foundListing.userId,
				},
			});

			if (!foundThread) {
				const [newThread] = await tx
					.insert(thread)
					.values({
						listingId,
						creatorId: userId,
						receiverId: foundListing.userId,
					})
					.returning();

				if (!newThread) {
					throw new Error("Failed to create thread");
				}

				foundThread = newThread;
			}

			await tx.insert(listingClaimRequest).values({
				listingId,
				userId,
			});

			await tx.insert(message).values({
				body: `Hi! I would like to claim your listing: ${foundListing.title}`,
				senderId: userId,
				receiverId: foundListing.userId,
				threadId: foundThread.id,
			});

			return foundThread;
		});

		return buildResponse(foundThread);
	}

	async update(id: string, userId: string, data: UpdateListingDto) {
		const [foundListing] = await this.drizzle.db
			.select()
			.from(listing)
			.where(eq(listing.id, id));

		if (!foundListing) throw new NotFoundException("Listing not found");
		if (foundListing.userId !== userId) throw new ForbiddenException();

		const updateData: Partial<typeof listing.$inferInsert> = {};
		if (data.title !== undefined) updateData.title = data.title;
		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.category !== undefined) updateData.category = data.category;
		if (data.condition !== undefined) updateData.condition = data.condition;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.address !== undefined) updateData.address = data.address;
		if (data.lat !== undefined && data.lng !== undefined) {
			updateData.location = { lat: data.lat, lng: data.lng };
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

		return { ...updatedListing, images };
	}

	async remove(id: string, userId: string) {
		const [foundListing] = await this.drizzle.db
			.select()
			.from(listing)
			.where(eq(listing.id, id));

		if (!foundListing) throw new NotFoundException("Listing not found");
		if (foundListing.userId !== userId) throw new ForbiddenException();

		await this.drizzle.db.delete(listing).where(eq(listing.id, id));
		return { success: true };
	}

	async findByUser(userId: string) {
		const listings = await this.drizzle.db
			.select()
			.from(listing)
			.where(eq(listing.userId, userId))
			.orderBy(desc(listing.createdAt));

		if (listings.length === 0) return [];

		const listingIds = listings.map((l) => l.id);

		const [images, [owner]] = await Promise.all([
			this.drizzle.db
				.select()
				.from(listingImage)
				.where(inArray(listingImage.listingId, listingIds))
				.orderBy(asc(listingImage.order)),
			this.drizzle.db
				.select({ id: user.id, name: user.name, image: user.image })
				.from(user)
				.where(eq(user.id, userId)),
		]);

		return listings.map((l) => ({
			...l,
			images: images.filter((img) => img.listingId === l.id).slice(0, 1),
			user: owner ?? null,
		}));
	}
}
