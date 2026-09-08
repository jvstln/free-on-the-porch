import { z } from "zod";

export const CreateBlockSchema = z.object({
	blockedId: z.string(),
});

export type CreateBlockDto = z.infer<typeof CreateBlockSchema>;
