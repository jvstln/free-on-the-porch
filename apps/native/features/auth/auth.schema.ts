import { emailSchema, passwordSchema } from "@free-on-the-pouch/shared/schemas";
import z from "zod";

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.min(1, "Name is required"),
	email: emailSchema,
	password: passwordSchema,
	agreed: z
		.boolean()
		.refine((val) => val === true, "You must agree to the guidelines to join"),
});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});
