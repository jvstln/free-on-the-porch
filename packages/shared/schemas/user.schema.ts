import { z } from "zod";
import { emailSchema, passwordSchema, urlSchema } from "./generic.schema";

export const RegisterSchema = z.object({
	name: z.string().min(2).max(50),
	email: emailSchema,
	password: passwordSchema,
});

export const UpdateProfileSchema = z.object({
	name: z.string().min(2).max(50).optional(),
	image: urlSchema.optional(),
	bio: z.string().max(200).optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
