export interface IFileStorageService {
	uploadImage(options: UploadOptions): Promise<UploadResult>;
	uploadVideo(options: UploadOptions): Promise<UploadResult>;
	uploadRaw(options: UploadOptions): Promise<UploadResult>;
	delete(
		publicId: string,
		options?: { resourceType?: string; type?: string },
	): Promise<void>;
	cleanupOrphaned(publicIds: string[]): Promise<void>;
}

export type UploadOptions = {
	file: Express.Multer.File;
};

export type UploadResult = {
	publicId: string;
	url: string;
};
