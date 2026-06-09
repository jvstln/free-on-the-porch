import { z } from "zod";

export const CreateCommentSchema = z.object({
	body: z.string().min(1).max(500),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
