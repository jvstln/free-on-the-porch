import { z } from "zod";
import { THREAD_TYPE, ThreadTypeSchema } from "./enum.schema";
import { CursorPaginationSchema, TimestampSchema } from "./generic.schema";
import { ListingMinimalSchema } from "./listing.schema";
import { PublicUserSchema } from "./user.schema";

export const SendMessageSchema = z
	.object({
		threadId: z.string().optional(),
		listingId: z.string().optional(),
		receiverId: z.string().optional(),
		body: z.string().min(1).max(1000),
	})
	.check((ctx) => {
		const input = ctx.value;
		const targetCount = [
			input.threadId,
			input.listingId,
			input.receiverId,
		].filter(Boolean).length;
		if (targetCount === 0) {
			ctx.issues.push({
				input,
				code: "custom",
				path: ["threadId"],
				message: "One of threadId, listingId, or receiverId is required",
			});
		} else if (targetCount > 1) {
			ctx.issues.push({
				input,
				code: "custom",
				path: ["threadId"],
				message: "threadId, listingId, and receiverId are mutually exclusive",
			});
		}
	});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;

export const MessageSchema = z.object({
	id: z.string(),
	body: z.string(),
	threadId: z.string(),
	senderId: z.string(),
	read: z.boolean(),
	createdAt: TimestampSchema,
	updatedAt: TimestampSchema,
});

export type MessageDto = z.infer<typeof MessageSchema>;

export const ThreadsQuerySchema = z.object({
	type: z.enum(THREAD_TYPE).default("DM"),
	...CursorPaginationSchema.shape,
});

export type ThreadsQueryDto = z.input<typeof ThreadsQuerySchema>;
export type ThreadsQueryOutputDto = z.infer<typeof ThreadsQuerySchema>;

export const ThreadMinimalSchema = z.object({
	id: z.string(),
	type: ThreadTypeSchema,
	listingId: z.string().nullable(),
	createdAt: TimestampSchema,
	updatedAt: TimestampSchema,
});

export type ThreadMinimalDto = z.infer<typeof ThreadMinimalSchema>;

export const ThreadSchema = z.object({
	...ThreadMinimalSchema.shape,
	members: z.array(PublicUserSchema),
	messages: z.array(MessageSchema), // The last few messages in the thread
	listing: ListingMinimalSchema.nullable(),
});

export type ThreadDto = z.infer<typeof ThreadSchema>;

export const ConversationQuerySchema = z.object({
	type: z.enum(["threads", "listings", "users"]),
	id: z.string(),
	...CursorPaginationSchema.shape,
});

export type ConversationQueryDto = z.input<typeof ConversationQuerySchema>;
export type ConversationQueryOutputDto = z.infer<
	typeof ConversationQuerySchema
>;

export const ConversationSchema = z.object({
	...ThreadSchema.omit({}).shape,
	messages: z.array(MessageSchema),
});

export type ConversationDto = z.infer<typeof ConversationSchema>;
