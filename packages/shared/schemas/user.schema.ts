import { z } from "zod";
import { UrlSchema } from "./generic.schema";

export const UpdateProfileSchema = z.object({
	name: z.string().min(2).max(50).optional(),
	image: UrlSchema.optional(),
	bio: z.string().max(200).optional(),
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
