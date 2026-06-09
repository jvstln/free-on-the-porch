import { z } from "zod";

export const ListingCondition = z.enum([
	"NEW",
	"LIKE_NEW",
	"GOOD",
	"FAIR",
	"WORN",
]);
export const ListingStatus = z.enum([
	"AVAILABLE",
	"PICKED_UP",
	"EXPIRED",
	"REMOVED",
]);
export const ListingCategory = z.enum([
	"FURNITURE",
	"ELECTRONICS",
	"CLOTHING",
	"BOOKS",
	"TOYS",
	"KITCHEN",
	"SPORTS",
	"TOOLS",
	"GARDEN",
	"OTHER",
]);

export const CreateListingSchema = z.object({
	title: z.string().min(3).max(80),
	description: z.string().max(500).optional(),
	category: ListingCategory,
	condition: ListingCondition,
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	address: z.string().max(200).optional(), // human-readable, optional
});

export const UpdateListingSchema = CreateListingSchema.partial().extend({
	status: ListingStatus.optional(),
});

export const NearbyQuerySchema = z.object({
	lat: z.number(),
	lng: z.number(),
	radiusKm: z.number().min(0.5).max(50).default(10),
	category: ListingCategory.optional(),
	cursor: z.string().optional(), // for pagination
	limit: z.number().min(1).max(50).default(20),
});

export type CreateListingDto = z.infer<typeof CreateListingSchema>;
export type UpdateListingDto = z.infer<typeof UpdateListingSchema>;
export type NearbyQueryDto = z.infer<typeof NearbyQuerySchema>;
export type ListingConditionType = z.infer<typeof ListingCondition>;
export type ListingStatusType = z.infer<typeof ListingStatus>;
export type ListingCategoryType = z.infer<typeof ListingCategory>;
