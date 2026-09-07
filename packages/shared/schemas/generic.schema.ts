import z from "zod";
import { createErrorMap } from "zod-validation-error";

export { fromZodError } from "zod-validation-error";

z.config({
	customError: createErrorMap(),
});

export const emailSchema = z.email("Enter a valid email address").trim();
export const PasswordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Use at least 8 characters");

export const UrlSchema = z.url("Enter a valid URL");

export const TimestampSchema = z.union([z.string(), z.date()]);

export const CursorPaginationSchema = z.object({
	limit: z.coerce.number().min(1).max(50).default(20),
	cursor: z.string().optional(),
});

export type PaginatedResponse<T> = T extends unknown[]
	? {
			data: T;
			pagination: { nextCursor: string | null };
		}
	: {
			data: T;
			pagination?: { nextCursor: string | null };
		};
