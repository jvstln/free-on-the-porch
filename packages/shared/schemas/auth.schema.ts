import z from "zod";
import { emailSchema, passwordSchema } from "./generic.schema";

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
