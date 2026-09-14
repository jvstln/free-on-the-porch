import { z } from "zod";
import {
	ListingCategorySchema,
	ListingConditionSchema,
	ListingStatusSchema,
} from "./enum.schema";
import {
	CursorPaginationSchema,
	TimestampSchema,
	UrlSchema,
} from "./generic.schema";
import { PublicUserSchema } from "./user.schema";

const PointSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});

const CoercedPointSchema = z.object({
	lat: z.coerce.number().min(-90).max(90),
	lng: z.coerce.number().min(-180).max(180),
});

export const CreateListingSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.max(80, "Title must be under 80 characters"),
	description: z
		.string()
		.max(500, "Description must be under 500 characters")
		.nullish(),
	category: ListingCategorySchema,
	condition: ListingConditionSchema,
	address: z.string().max(200).optional(),
	location: PointSchema.optional(),
	status: ListingStatusSchema.optional(),
});

export type CreateListingDto = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = z.object({
	...CreateListingSchema.partial().shape,
	status: ListingStatusSchema.optional(),
});

export type UpdateListingDto = z.infer<typeof UpdateListingSchema>;

export const FeedListingsQuerySchema = z.object({
	radiusMeters: z
		.union([z.enum(["closest"]), z.coerce.number<number>().min(0)])
		.default("closest"),
	// Feed ordering: "closest" (default) blends proximity + freshness, "newest"
	// is pure recency. When `query` is present, relevance rank wins instead.
	sort: z.enum(["closest", "newest"]).default("closest"),
	category: z
		.union([ListingCategorySchema, z.literal("")])
		.transform((val) => val || undefined)
		.optional(),
	query: z
		.string()
		.max(100)
		.transform((val) => val.trim() || undefined)
		.optional(),
	...CoercedPointSchema.shape,
	...CursorPaginationSchema.shape,
});

export type FeedListingsQueryDto = z.input<typeof FeedListingsQuerySchema>;
export type FeedListingsQueryOutputDto = z.infer<
	typeof FeedListingsQuerySchema
>;

export const ListingImageSchema = z.object({
	url: UrlSchema,
});

export type ListingImageDto = z.infer<typeof ListingImageSchema>;

export const ListingCommentSchema = z.object({
	id: z.string(),
	body: z.string(),
	createdAt: z.union([z.string(), z.date()]),
	updatedAt: z.union([z.string(), z.date()]),
	userId: z.string(),
	listingId: z.string(),
	user: PublicUserSchema.nullable(),
});

export type ListingCommentDto = z.infer<typeof ListingCommentSchema>;

// ─── Response DTOs ────────────────────────────────────────────────────────────

/**
 * Minimal listing shape used in card/list views (feed, my-listings, map pins).
 * Returned by GET /listings/feed and GET /listings/mine.
 */
export const ListingSchema = z.object({
	...CreateListingSchema.shape,
	id: z.string(),
	status: ListingStatusSchema,
	address: z.string().nullable().optional(),
	distanceMeters: z.number().nullable().optional(),
	// Full-text search relevance (0..1), only present when a `query` was sent.
	matchRank: z.number().nullable().optional(),
	images: z.array(ListingImageSchema),
	user: PublicUserSchema,
	createdAt: TimestampSchema,
	userId: z.string(),
	claimedByUserId: z.string().nullable().optional(),
});

export type ListingDto = z.infer<typeof ListingSchema>;

export const ListingMinimalSchema = ListingSchema.omit({
	user: true,
	distanceMeters: true,
});

export type ListingMinimalDto = z.infer<typeof ListingMinimalSchema>;

export const ListingClaimRequestSchema = z.object({
	id: z.string(),
	listingId: z.string(),
	userId: z.string(),
	createdAt: z.union([z.string(), z.date()]),
	updatedAt: z.union([z.string(), z.date()]),
	user: PublicUserSchema,
});

/**
 * Full listing shape used in detail view.
 */
export const ListingDetailSchema = ListingSchema.extend({
	comments: z.array(ListingCommentSchema),
	pendingClaims: z.array(ListingClaimRequestSchema),
});

export type ListingDetailDto = z.infer<typeof ListingDetailSchema>;

export type ListingClaimRequestDto = z.infer<typeof ListingClaimRequestSchema>;
