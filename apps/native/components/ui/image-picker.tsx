import * as ExpoImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { ImageViewer } from "@/components/ui/image-viewer";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { cn } from "@/lib/utils";

export type ImagePickerAsset = {
	uri: string;
	name?: string;
	type?: string;
	size?: number;
	width?: number;
	height?: number;
};

export interface ImagePickerProps {
	/** Current selected images: strings (URIs) or ImagePickerAsset objects */
	value?: (string | ImagePickerAsset)[];
	/** Callback fired when images are added or removed */
	onChange?: (assets: ImagePickerAsset[]) => void;
	/** Maximum number of photos allowed (default: 5) */
	max?: number;
	/** Whether multiple selection is supported (default: true) */
	multiple?: boolean;
	/** Enabled input sources: "camera" | "library" (default: ["camera", "library"]) */
	sources?: ("camera" | "library")[];
	/** Compression quality between 0 and 1 (default: 0.8) */
	quality?: number;
	/** Optional crop aspect ratio, e.g. [1, 1] for profile avatars */
	aspect?: [number, number];
	/** Allow image cropping/editing before adding (default: false) */
	allowsEditing?: boolean;
	/** Title text for the picker empty card */
	title?: string;
	/** Description/subtitle text for the picker empty card */
	description?: string;
	/** Enable tapping thumbnail to open fullscreen ImageViewer (default: true) */
	enablePreview?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Optional container className */
	className?: string;
}

export function ImagePicker({
	value = [],
	onChange,
	max = 5,
	multiple = true,
	sources = ["camera", "library"],
	quality = 0.8,
	aspect,
	allowsEditing = false,
	title,
	description,
	enablePreview = true,
	disabled = false,
	className,
}: ImagePickerProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);

	const normalizedValue: ImagePickerAsset[] = Array.isArray(value)
		? value.map((item) => (typeof item === "string" ? { uri: item } : item))
		: [];

	const hasCamera = sources.includes("camera");
	const hasLibrary = sources.includes("library");

	const pickFromLibrary = async () => {
		if (disabled) return;
		try {
			const { status } =
				await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== "granted") {
				toast.error("Photo library permission is required to select photos");
				return;
			}

			const remainingSlots = multiple ? max - normalizedValue.length : 1;
			if (remainingSlots <= 0) return;

			const result = await ExpoImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsMultipleSelection: multiple && remainingSlots > 1,
				selectionLimit: multiple ? remainingSlots : 1,
				quality,
				allowsEditing: !multiple && allowsEditing,
				aspect,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const picked: ImagePickerAsset[] = result.assets.map((asset) => ({
					uri: asset.uri,
					width: asset.width,
					height: asset.height,
					size: asset.fileSize,
					name: asset.fileName ?? undefined,
					type: asset.mimeType ?? undefined,
				}));

				const next = multiple
					? [...normalizedValue, ...picked].slice(0, max)
					: picked.slice(0, 1);

				onChange?.(next);
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Failed to open photo library: ${message}`);
		}
	};

	const takePhoto = async () => {
		if (disabled) return;
		try {
			const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
			if (status !== "granted") {
				toast.error("Camera permission is required to take photos");
				return;
			}

			const result = await ExpoImagePicker.launchCameraAsync({
				mediaTypes: ["images"],
				quality,
				allowsEditing,
				aspect,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const picked: ImagePickerAsset[] = result.assets.map((asset) => ({
					uri: asset.uri,
					width: asset.width,
					height: asset.height,
					size: asset.fileSize,
					name: asset.fileName ?? undefined,
					type: asset.mimeType ?? undefined,
				}));

				const next = multiple
					? [...normalizedValue, ...picked].slice(0, max)
					: picked.slice(0, 1);

				onChange?.(next);
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "";
			if (message.includes("simulator") || message.includes("not available")) {
				if (hasLibrary) {
					toast.warning(
						"Camera unavailable on simulator. Opening photo library...",
					);
					await pickFromLibrary();
				} else {
					toast.error("Camera is not available on this device/simulator.");
				}
			} else {
				toast.error(`Failed to open camera: ${message}`);
			}
		}
	};

	const removePhoto = (index: number) => {
		if (disabled) return;
		const next = normalizedValue.filter((_, i) => i !== index);
		onChange?.(next);
	};

	const handleAddPress = () => {
		if (disabled) return;
		if (hasCamera && hasLibrary) {
			setIsSheetOpen(true);
		} else if (hasCamera) {
			takePhoto();
		} else if (hasLibrary) {
			pickFromLibrary();
		}
	};

	const defaultTitle = multiple ? "Add photos" : "Select photo";
	const defaultDesc = multiple
		? `Snap a photo or choose from your library (up to ${max})`
		: "Snap a photo or choose from your library";

	return (
		<View className={cn("w-full", className)}>
			{normalizedValue.length === 0 ? (
				<View className="flex-col items-center justify-center rounded-2xl border border-border border-dashed bg-muted/30 p-6">
					<View className="mb-2 size-12 items-center justify-center rounded-full bg-primary/10">
						<Icon as={Camera} className="size-6 text-primary" />
					</View>
					<Text
						type="body-sm"
						className="text-center font-semibold text-foreground"
					>
						{title ?? defaultTitle}
					</Text>
					<Text
						type="body-xs"
						className="mt-0.5 mb-4 text-center text-muted-foreground"
					>
						{description ?? defaultDesc}
					</Text>
					<View className="flex-row items-center gap-3">
						{hasCamera && (
							<Button
								appearance="outline"
								size="sm"
								className="flex-row items-center gap-1.5"
								onPress={takePhoto}
								disabled={disabled}
							>
								<Icon as={Camera} className="size-4 text-primary" />
								Take Photo
							</Button>
						)}
						{hasLibrary && (
							<Button
								appearance="outline"
								size="sm"
								className="flex-row items-center gap-1.5"
								onPress={pickFromLibrary}
								disabled={disabled}
							>
								<Icon as={ImageIcon} className="size-4 text-primary" />
								Photo Library
							</Button>
						)}
					</View>
				</View>
			) : (
				<View className="flex-row flex-wrap gap-2.5">
					{normalizedValue.map((photo, index) => (
						<View key={photo.uri} className="relative size-20">
							<Pressable
								disabled={!enablePreview}
								onPress={() => setPreviewIndex(index)}
								className="size-20 overflow-hidden rounded-xl active:opacity-90"
							>
								<Image
									source={{ uri: photo.uri }}
									className="size-20 rounded-xl"
									contentFit="cover"
								/>
							</Pressable>
							{!disabled && (
								<Pressable
									onPress={() => removePhoto(index)}
									className="absolute -top-1.5 -right-1.5 size-6 items-center justify-center rounded-full bg-destructive shadow-sm active:scale-95"
									accessibilityLabel="Remove photo"
								>
									<Icon
										as={Trash2}
										className="size-3 text-destructive-foreground"
									/>
								</Pressable>
							)}
						</View>
					))}

					{multiple && normalizedValue.length < max && !disabled && (
						<Pressable
							onPress={handleAddPress}
							className="size-20 items-center justify-center rounded-xl border border-border border-dashed bg-muted/30 active:opacity-75"
							accessibilityLabel="Add more photos"
						>
							<Icon as={Plus} className="size-6 text-primary" />
							<Text
								type="body-xs"
								className="mt-1 font-medium text-muted-foreground"
							>
								Add
							</Text>
						</Pressable>
					)}
				</View>
			)}

			{/* Source selection BottomSheet */}
			<BottomSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<BottomSheetContent>
					<BottomSheetTitle>Add Photo</BottomSheetTitle>
					<BottomSheetDescription>
						Take a photo with your camera or select an existing image from your
						library.
					</BottomSheetDescription>
					<View className="mt-4 gap-3">
						{hasCamera && (
							<Button
								appearance="outline"
								size="lg"
								className="justify-start gap-3 px-4"
								onPress={() => {
									setIsSheetOpen(false);
									takePhoto();
								}}
							>
								<Icon as={Camera} className="size-5 text-primary" />
								Take Photo
							</Button>
						)}

						{hasLibrary && (
							<Button
								appearance="outline"
								size="lg"
								className="justify-start gap-3 px-4"
								onPress={() => {
									setIsSheetOpen(false);
									pickFromLibrary();
								}}
							>
								<Icon as={ImageIcon} className="size-5 text-primary" />
								Choose from Library
							</Button>
						)}
					</View>
				</BottomSheetContent>
			</BottomSheet>

			{/* Fullscreen Image Preview */}
			{enablePreview && previewIndex !== null && (
				<ImageViewer
					images={normalizedValue.map((item) => item.uri)}
					visible={previewIndex !== null}
					initialIndex={previewIndex}
					onClose={() => setPreviewIndex(null)}
				/>
			)}
		</View>
	);
}
