export interface IFileStorageService {
	/** Upload a single or multiple image files concurrently */
	uploadImages(options: UploadOption): Promise<UploadResult>;
	uploadImages(optionsArray: UploadOption[]): Promise<UploadResult[]>;

	/** Upload a single or multiple video files concurrently */
	uploadVideos(options: UploadOption): Promise<UploadResult>;
	uploadVideos(optionsArray: UploadOption[]): Promise<UploadResult[]>;

	/** Upload raw file */
	uploadRaw(options: UploadOption): Promise<UploadResult>;

	/** Delete single or multiple files concurrently by publicIds */
	deleteFiles(options?: DeleteOption): Promise<void>;
	deleteFiles(options?: DeleteOption[]): Promise<void>;
}

export type DeleteOption = {
	id: string;
	resourceType?: string;
	type?: string;
};

export type UploadOption = {
	file: Express.Multer.File;
};

export type UploadResult = {
	publicId: string;
	url: string;
};
