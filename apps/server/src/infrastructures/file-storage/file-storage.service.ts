import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { UploadApiResponse } from "cloudinary";
import { cloudinaryProvider } from "./cloudinary.provider";
import type {
	IFileStorageService,
	UploadOptions,
	UploadResult,
} from "./file-storage.type";

@Injectable()
// File-storage adapter on top of Cloudinary. Feature code depends on this
// abstraction (IFileStorageService) rather than hitting the Cloudinary SDK
// directly, so the underlying provider can be swapped.
export class FileStorageService implements IFileStorageService {
	constructor(
		@Inject(cloudinaryProvider.provide)
		private readonly cloudinary: ReturnType<
			typeof cloudinaryProvider.useFactory
		>,
	) {}

	private async uploadBuffer(
		buffer: Buffer,
		options: object,
	): Promise<UploadApiResponse> {
		return new Promise<UploadApiResponse>((resolve, reject) => {
			const stream = this.cloudinary.uploader.upload_stream(
				options,
				(error, result) => {
					if (error || !result) {
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

	async uploadImage(options: UploadOptions): Promise<UploadResult> {
		const result = await this.uploadBuffer(options.file.buffer, {
			resource_type: "image",
			type: "upload",
		});
		return { publicId: result.public_id, url: result.secure_url };
	}

	async uploadVideo(options: UploadOptions): Promise<UploadResult> {
		const result = await this.uploadBuffer(options.file.buffer, {
			resource_type: "video",
			type: "upload",
		});
		return { publicId: result.public_id, url: result.secure_url };
	}

	async uploadRaw(options: UploadOptions): Promise<UploadResult> {
		const result = await this.uploadBuffer(options.file.buffer, {
			resource_type: "raw",
			type: "upload",
		});
		return { publicId: result.public_id, url: result.secure_url };
	}

	async delete(
		publicId: string,
		options?: { resourceType?: string; type?: string },
	): Promise<void> {
		await this.cloudinary.uploader.destroy(publicId, {
			resource_type: options?.resourceType || "image",
			type: options?.type || "upload",
		});
	}

	async cleanupOrphaned(publicIds: string[]): Promise<void> {
		await Promise.all(publicIds.map((id) => this.delete(id)));
	}
}
