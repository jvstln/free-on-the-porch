import { z } from "zod";

export const ReportReason = z.enum([
	"SPAM",
	"INAPPROPRIATE",
	"ALREADY_TAKEN",
	"FAKE",
	"OTHER",
]);

export const CreateReportSchema = z
	.object({
		reason: ReportReason,
		details: z.string().max(300).optional(),
		listingId: z.string().optional(),
		reportedUserId: z.string().optional(),
	})
	.refine((d) => d.listingId || d.reportedUserId, {
		message: "Must report a listing or a user",
	});

export type CreateReportDto = z.infer<typeof CreateReportSchema>;
