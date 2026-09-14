import type {
	DeleteFilesDto,
	UploadFileResultDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export type LocalFileAsset = {
	uri: string;
	name?: string;
	type?: string;
};

/**
 * Normalizes a local file URI into a FormData-compatible file descriptor for React Native.
 */
function resolveFileDescriptor(file: LocalFileAsset, defaultExt = "jpg") {
	const filename =
		file.name || file.uri.split("/").pop() || `file.${defaultExt}`;
	const ext = filename.split(".").pop()?.toLowerCase() || defaultExt;
	const mimeType =
		file.type ||
		(defaultExt === "mp4"
			? `video/${ext}`
			: `image/${ext === "jpg" ? "jpeg" : ext}`);

	return {
		uri: file.uri,
		name: filename,
		type: mimeType,
	} as unknown as Blob;
}

export const fileStorageApi = {
	/**
	 * Uploads one or more images in a batch multipart request.
	 * Returns an array of uploaded file descriptors ({ publicId, url }).
	 */
	async uploadImages(files: LocalFileAsset[]): Promise<UploadFileResultDto[]> {
		if (!files || files.length === 0) {
			return [];
		}

		const formData = new FormData();
		for (const file of files) {
			formData.append("files", resolveFileDescriptor(file, "jpg"));
		}

		const { data } = await api.post<{ data: UploadFileResultDto[] }>(
			"/files/upload/images",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } },
		);

		return data.data;
	},

	/**
	 * Uploads one or more videos in a batch multipart request.
	 * Returns an array of uploaded file descriptors ({ publicId, url }).
	 */
	async uploadVideos(files: LocalFileAsset[]): Promise<UploadFileResultDto[]> {
		if (!files || files.length === 0) {
			return [];
		}

		const formData = new FormData();
		for (const file of files) {
			formData.append("files", resolveFileDescriptor(file, "mp4"));
		}

		const { data } = await api.post<{ data: UploadFileResultDto[] }>(
			"/files/upload/videos",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } },
		);

		return data.data;
	},

	/**
	 * Deletes files from storage by public ID(s) via a JSON POST request.
	 */
	async deleteFiles(payload: DeleteFilesDto): Promise<{ success: boolean }> {
		const { data } = await api.post<{ data: { success: boolean } }>(
			"/files/delete",
			payload,
		);

		return data.data;
	},
};
