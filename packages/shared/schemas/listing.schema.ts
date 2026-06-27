import { z } from "zod";
import type {
	ListingCategoryDto,
	ListingConditionDto,
	ListingStatusDto,
} from "./enum.schema";
import {
	ListingCategorySchema,
	ListingConditionSchema,
	ListingStatusSchema,
} from "./enum.schema";
import { PaginationQuerySchema } from "./generic.schema";
import type { PublicUserDto } from "./user.schema";

// ─── Request schemas ──────────────────────────────────────────────────────────

export const CreateListingSchema = z.object({
	title: z.string().min(3).max(80),
	description: z.string().max(500).optional(),
	category: ListingCategorySchema,
	condition: ListingConditionSchema,
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	address: z.string().max(200).optional(),
});

export const UpdateListingSchema = CreateListingSchema.partial().extend({
	status: ListingStatusSchema.optional(),
});

export const NearbyListingsQuerySchema = z.object({
	lat: z.coerce.number(),
	lng: z.coerce.number(),
	radiusMeters: z
		.union([z.enum(["closest"]), z.coerce.number<number>().min(0)])
		.default("closest"),
	category: z
		.union([ListingCategorySchema, z.literal("")])
		.transform((val) => val || undefined)
		.optional(),
	cursor: z.string().optional(),
	limit: PaginationQuerySchema.shape.limit,
});

// ─── Inferred request DTOs ────────────────────────────────────────────────────

export type CreateListingDto = z.infer<typeof CreateListingSchema>;
export type UpdateListingDto = z.infer<typeof UpdateListingSchema>;
export type NearbyListingsQueryDto = z.input<typeof NearbyListingsQuerySchema>;
export type NearbyListingsQueryOutputDto = z.infer<
	typeof NearbyListingsQuerySchema
>;

// ─── Shared sub-types ─────────────────────────────────────────────────────────

export interface ListingImageDto {
	url: string;
}

export interface ListingCommentDto {
	id: string;
	body: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	userId: string;
	listingId: string;
	user: PublicUserDto | null;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

/**
 * Minimal listing shape used in card/list views (feed, my-listings, map pins).
 * Returned by GET /listings/nearby and GET /listings/mine.
 */
export interface ListingDto {
	id: string;
	title: string;
	description?: string | null;
	category: ListingCategoryDto;
	condition: ListingConditionDto;
	status: ListingStatusDto;
	address?: string | null;
	distanceMeters?: number | null;
	images: ListingImageDto[];
	user: PublicUserDto | null;
	createdAt: string | Date;
	userId: string;
	location?: { lat: number; lng: number } | null;
	claimedByUserId?: string | null;
}

export interface ListingClaimRequestDto {
	id: string;
	listingId: string;
	userId: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	user: PublicUserDto;
}

/**
 * Full listing shape used in detail view.
 * Returned by GET /listings/:id — extends ListingDto with comments.
 */
export interface ListingDetailDto extends ListingDto {
	comments: ListingCommentDto[];
	pendingClaims: ListingClaimRequestDto[];
}
