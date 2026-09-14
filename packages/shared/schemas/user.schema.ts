import { z } from "zod";
import { TimestampSchema, UrlSchema } from "./generic.schema";

// ─── User Settings ───────────────────────────────────────────────────────────

export const UserSettingsSchema = z.object({
	id: z.string(),
	userId: z.string(),
	notifyNearbyListings: z.boolean(),
	notifyMessages: z.boolean(),
	defaultRadiusKm: z.number().int().min(1).max(100),
	createdAt: TimestampSchema,
	updatedAt: TimestampSchema,
});

export type UserSettingsDto = z.infer<typeof UserSettingsSchema>;

export const UpdateUserSettingsSchema = UserSettingsSchema.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export type UpdateUserSettingsDto = z.infer<typeof UpdateUserSettingsSchema>;

export const UpdateProfileSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be under 50 characters")
		.optional(),
	image: UrlSchema.optional(),
	bio: z.string().max(200, "Bio must be under 200 characters").optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const PublicUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
	createdAt: z.union([z.string(), z.date()]).optional(),
});

export type PublicUserDto = z.infer<typeof PublicUserSchema>;

export const CurrentUserSchema = z.object({
	...PublicUserSchema.shape,
	email: z.email(),
	emailVerified: z.boolean(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type CurrentUserDto = z.infer<typeof CurrentUserSchema>;
