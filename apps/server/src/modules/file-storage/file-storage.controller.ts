import {
	type DeleteFilesDto,
	DeleteFilesSchema,
} from "@free-on-the-porch/shared/schemas";
import {
	BadRequestException,
	Body,
	Controller,
	Post,
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { FileStorageService } from "./file-storage.service";

const MAX_IMAGE_FILES = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per image

const MAX_VIDEO_FILES = 5;
const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB per video

/**
 * FileStorageController handles multipart file upload and deletion endpoints.
 * Routes are protected by global AuthGuard, ensuring only authenticated users can upload or delete files.
 * Entities (such as listings) only store the resulting public URLs, decoupling entity creation from binary uploads.
 */
@Controller("files")
export class FileStorageController {
	constructor(private readonly fileStorageService: FileStorageService) {}

	/**
	 * Uploads one or more images in a single multipart request.
	 * Multipart form field name: "files"
	 */
	@Post("upload/images")
	@UseInterceptors(
		FilesInterceptor("files", MAX_IMAGE_FILES, {
			storage: memoryStorage(),
			limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
		}),
	)
	async uploadImages(@UploadedFiles() files?: Express.Multer.File[]) {
		if (!files || files.length === 0) {
			throw new BadRequestException("At least one image file is required");
		}

		for (const file of files) {
			if (!file.mimetype.startsWith("image/")) {
				throw new BadRequestException(
					`File ${file.originalname} is not a valid image format`,
				);
			}
		}

		const results = await this.fileStorageService.uploadImages(
			files.map((file) => ({ file })),
		);
		return { data: results };
	}

	/**
	 * Uploads one or more videos in a single multipart request.
	 * Multipart form field name: "files"
	 */
	@Post("upload/videos")
	@UseInterceptors(
		FilesInterceptor("files", MAX_VIDEO_FILES, {
			storage: memoryStorage(),
			limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
		}),
	)
	async uploadVideos(@UploadedFiles() files?: Express.Multer.File[]) {
		if (!files || files.length === 0) {
			throw new BadRequestException("At least one video file is required");
		}

		for (const file of files) {
			if (!file.mimetype.startsWith("video/")) {
				throw new BadRequestException(
					`File ${file.originalname} is not a valid video format`,
				);
			}
		}

		const results = await this.fileStorageService.uploadVideos(
			files.map((file) => ({ file })),
		);
		return { data: results };
	}

	/**
	 * Deletes one or more files from storage by their public IDs.
	 */
	@Post("delete")
	async deleteFiles(
		@Body(new ZodValidationPipe(DeleteFilesSchema)) body: DeleteFilesDto,
	) {
		await this.fileStorageService.deleteFiles(body);

		return { data: { success: true } };
	}
}
