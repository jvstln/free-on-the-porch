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

export const ForgotPasswordSchema = z.object({
	email: emailSchema,
});

export const ResetPasswordSchema = z
	.object({
		password: PasswordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
