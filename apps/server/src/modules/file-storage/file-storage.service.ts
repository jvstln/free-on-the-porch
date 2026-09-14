import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { UploadApiResponse } from "cloudinary";
import { AppLogger } from "../../infrastructures/logger/app-logger.service";
import { cloudinaryProvider } from "./cloudinary.provider";
import type {
	DeleteOption,
	IFileStorageService,
	UploadOption,
	UploadResult,
} from "./file-storage.type";

/**
 * FileStorageService wraps Cloudinary SDK operations.
 * Controllers and other services consume this abstraction rather than
 * interacting directly with the third-party Cloudinary SDK.
 */
@Injectable()
export class FileStorageService implements IFileStorageService {
	constructor(
		private readonly logger: AppLogger,
		@Inject(cloudinaryProvider.provide)
		private readonly cloudinary: ReturnType<
			typeof cloudinaryProvider.useFactory
		>,
	) {}

	/**
	 * Uploads an in-memory buffer via Cloudinary upload stream.
	 */
	private async uploadBuffer(
		buffer: Buffer,
		options: object,
	): Promise<UploadApiResponse> {
		return new Promise<UploadApiResponse>((resolve, reject) => {
			const stream = this.cloudinary.uploader.upload_stream(
				options,
				(error, result) => {
					if (error || !result) {
						this.logger.error("Error uploading file", error);

						return reject(
							new BadRequestException(
								`Error uploading ${"resource_type" in options && options.resource_type} file`,
							),
						);
					}
					resolve(result);
				},
			);
			stream.end(buffer);
		});
	}

	async uploadImages(options: UploadOption): Promise<UploadResult>;
	async uploadImages(options: UploadOption[]): Promise<UploadResult[]>;
	async uploadImages(options: UploadOption | UploadOption[]) {
		if (Array.isArray(options)) {
			return Promise.all(options.map((option) => this.uploadImages(option)));
		}

		const result = await this.uploadBuffer(options.file.buffer, {
			resource_type: "image",
		});
		return { publicId: result.public_id, url: result.secure_url };
	}

	async uploadVideos(options: UploadOption): Promise<UploadResult>;
	async uploadVideos(options: UploadOption[]): Promise<UploadResult[]>;
	async uploadVideos(options: UploadOption | UploadOption[]) {
		if (Array.isArray(options)) {
			return Promise.all(options.map((option) => this.uploadVideos(option)));
		}

		const result = await this.uploadBuffer(options.file.buffer, {
			resource_type: "video",
		});
		return { publicId: result.public_id, url: result.secure_url };
	}

	async uploadRaw(options: UploadOption): Promise<UploadResult> {
		const result = await this.uploadBuffer(options.file.buffer, {
			resource_type: "raw",
		});
		return { publicId: result.public_id, url: result.secure_url };
	}

	async deleteFiles(options: DeleteOption): Promise<void>;
	async deleteFiles(options: DeleteOption[]): Promise<void>;
	async deleteFiles(options: DeleteOption | DeleteOption[]) {
		if (Array.isArray(options)) {
			Promise.all(options.map((option) => this.deleteFiles(option)));
			return;
		}

		await this.cloudinary.uploader.destroy(options.id, {
			resource_type: options?.resourceType || "image",
			type: options?.type || "upload",
		});
	}
}
