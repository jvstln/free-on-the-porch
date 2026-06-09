import { z } from "zod";

export const SendMessageSchema = z.object({
	receiverId: z.string(),
	listingId: z.string().optional(), // context — what listing is this about
	body: z.string().min(1).max(1000),
});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;
