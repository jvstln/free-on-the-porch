import { z } from "zod";
import { UrlSchema } from "./generic.schema";

/**
 * Result returned after successfully uploading an individual file to storage.
 */
export const UploadFileResultSchema = z.object({
	publicId: z.string().min(1, "Public ID is required"),
	url: UrlSchema,
});

export type UploadFileResultDto = z.infer<typeof UploadFileResultSchema>;

/**
 * Plural upload response DTO containing an array of uploaded file results.
 */
export const UploadFilesResponseSchema = z.array(UploadFileResultSchema);

export type UploadFilesResponseDto = z.infer<typeof UploadFilesResponseSchema>;

/**
 * Request payload for deleting one or multiple files from storage by their public IDs.
 */
export const DeleteFilesSchema = z
	.array(
		z.object({
			id: z.string().min(1, "Public ID cannot be empty"),
			resourceType: z.enum(["image", "video", "raw"]).optional(),
		}),
	)
	.min(1, "At least one public ID is required");

export type DeleteFilesDto = z.infer<typeof DeleteFilesSchema>;
