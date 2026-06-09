import z from "zod";

export const emailSchema = z.email("Enter a valid email address").trim();
export const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Use at least 8 characters");

export const urlSchema = z.url("Enter a valid URL");
