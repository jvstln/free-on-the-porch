import { z } from "zod";
import { ReportReasonSchema } from "./enum.schema";

export const CreateReportSchema = z
	.object({
		reason: ReportReasonSchema,
		details: z.string().max(300).optional(),
		listingId: z.string().optional(),
		reportedUserId: z.string().optional(),
	})
	.refine((dto) => dto.listingId || dto.reportedUserId, {
		message: "Must report a listing or a user",
	});

export type CreateReportDto = z.infer<typeof CreateReportSchema>;

// Factory for the report body schema, bound to the authenticated reporter.
// The reporter id comes from the session (never the body), so self-report
// prevention can only be validated server-side — pass session.user.id here.
export function createReportSchema(reporterId: string) {
	return CreateReportSchema.check((ctx) => {
		if (ctx.value.reportedUserId === reporterId) {
			ctx.issues.push({
				input: ctx.value,
				code: "custom",
				path: ["reportedUserId"],
				message: "You cannot report yourself",
			});
		}
	});
}
