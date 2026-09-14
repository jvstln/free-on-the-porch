import type { DeleteFilesDto } from "@free-on-the-porch/shared/schemas";
import { useMutation } from "@tanstack/react-query";
import type { ImagePickerAsset } from "@/components/ui/image-picker";
import { fileStorageApi, type LocalFileAsset } from "../file-storage.api";

/**
 * Checks if a URI is already an absolute remote web URL (e.g. Cloudinary, HTTPS).
 */
export function isRemoteUrl(uri: string): boolean {
	return uri.startsWith("http://") || uri.startsWith("https://");
}

/**
 * Helper to upload an array of ImagePickerAsset objects.
 * Separates existing remote URLs from newly selected local files,
 * uploads local files in a batch, and restores the original ordering.
 *
 * @param assets Array of image assets selected by the user.
 * @returns Array of remote URLs corresponding to the assets in their original order.
 */
export async function uploadMediaAssets(
	assets: ImagePickerAsset[],
): Promise<string[]> {
	if (!assets || assets.length === 0) {
		return [];
	}

	// Identify which assets require uploading and which are already hosted
	const toUpload: { index: number; asset: LocalFileAsset }[] = [];
	const results: string[] = new Array(assets.length);

	assets.forEach((asset, index) => {
		if (isRemoteUrl(asset.uri)) {
			results[index] = asset.uri;
		} else {
			toUpload.push({
				index,
				asset: {
					uri: asset.uri,
					name: asset.name,
					type: asset.type,
				},
			});
		}
	});

	// If all assets were already remote URLs, return immediately
	if (toUpload.length === 0) {
		return results;
	}

	// Upload all local assets in a single batch request
	const uploaded = await fileStorageApi.uploadImages(
		toUpload.map((item) => item.asset),
	);

	// Insert uploaded URLs back into their original positional order
	toUpload.forEach((item, uploadIndex) => {
		const uploadedFile = uploaded[uploadIndex];
		if (uploadedFile?.url) {
			results[item.index] = uploadedFile.url;
		}
	});

	return results;
}

/**
 * Hook for uploading images in batch.
 */
export function useUploadImages() {
	return useMutation({
		mutationFn: (files: LocalFileAsset[]) => fileStorageApi.uploadImages(files),
	});
}

/**
 * Hook for uploading videos in batch.
 */
export function useUploadVideos() {
	return useMutation({
		mutationFn: (files: LocalFileAsset[]) => fileStorageApi.uploadVideos(files),
	});
}

/**
 * Hook for deleting files from storage by public IDs.
 */
export function useDeleteFiles() {
	return useMutation({
		mutationFn: (ids: DeleteFilesDto) => fileStorageApi.deleteFiles(ids),
	});
}
