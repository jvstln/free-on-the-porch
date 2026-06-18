import z from "zod";
import { createErrorMap } from "zod-validation-error";

z.config({
	customError: createErrorMap(),
});

export const emailSchema = z.email("Enter a valid email address").trim();
export const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Use at least 8 characters");

export const urlSchema = z.url("Enter a valid URL");

export { fromZodError } from "zod-validation-error";
