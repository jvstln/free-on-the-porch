import { z } from "zod";
import { ReportReasonSchema } from "./enum.schema";

export const CreateReportSchema = z
	.object({
		reason: ReportReasonSchema,
		details: z.string().max(300).optional(),
		listingId: z.string().optional(),
		reportedUserId: z.string().optional(),
	})
	.refine((d) => d.listingId || d.reportedUserId, {
		message: "Must report a listing or a user",
	});

export type CreateReportDto = z.infer<typeof CreateReportSchema>;
