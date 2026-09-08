import { z } from "zod";
import { CursorPaginationSchema, TimestampSchema } from "./generic.schema";

// ─── Response ────────────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
	id: z.string(),
	type: z.enum([
		"NEW_NEARBY_LISTING",
		"MESSAGE_RECEIVED",
		"COMMENT_ON_LISTING",
		"LISTING_EXPIRED",
	]),
	title: z.string().max(100),
	body: z.string().max(300),
	read: z.boolean(),
	data: z.record(z.string(), z.unknown()).nullable(),
	userId: z.string(),
	createdAt: TimestampSchema,
	updatedAt: TimestampSchema,
});

export type NotificationDto = z.infer<typeof NotificationSchema>;

// ─── List Query ──────────────────────────────────────────────────────────────

export const NotificationListQuerySchema = z.object({
	...CursorPaginationSchema.shape,
	read: z
		.enum(["true", "false"])
		.transform((v) => v === "true")
		.optional(),
});

export type NotificationListQueryDto = z.infer<
	typeof NotificationListQuerySchema
>;
export type NotificationListQueryOutputDto = z.output<
	typeof NotificationListQuerySchema
>;
