import z from "zod";
import { emailSchema, PasswordSchema } from "./generic.schema";

export const RegisterSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.min(1, "Name is required")
		.max(50),
	email: emailSchema,
	password: PasswordSchema,
	agreed: z
		.boolean()
		.refine((val) => val === true, "You must agree to the guidelines to join"),
});

export const LoginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
