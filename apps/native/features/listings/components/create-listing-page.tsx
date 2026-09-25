import type { CreateListingDto } from "@free-on-the-porch/shared/schemas";
import { getErrorMessage } from "@free-on-the-porch/shared/utils";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { Icon } from "@/components/ui/icon";
import type { ImagePickerAsset } from "@/components/ui/image-picker";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { uploadMediaAssets } from "@/features/file-storage/hooks/use-file-upload";
import { useCreateListing } from "../hooks/use-listings";
import { ListingForm } from "./listing-form";

export function CreateListingPage() {
	const router = useRouter();
	const createMutation = useCreateListing();

	/**
	 * Handles listing creation flow:
	 * 1. Uploads picked image assets to the storage module.
	 * 2. Receives Cloudinary secure URLs.
	 * 3. Dispatches pure JSON payload to POST /listings.
	 *
	 * TanStack Form tracks the submission state automatically while this async handler runs.
	 */
	const handleSubmit = async (
		values: Omit<CreateListingDto, "images"> & { photos: ImagePickerAsset[] },
	) => {
		if (values.photos.length === 0) {
			toast.error("Please add at least one photo of the item.");
			return;
		}

		try {
			// Step 1: Upload media files in batch to obtain public URLs
			const imageUrls = await uploadMediaAssets(values.photos);

			if (imageUrls.length === 0) {
				toast.error("Failed to upload listing photos. Please try again.");
				return;
			}

			// Step 2: Post the listing payload as pure JSON
			await createMutation.mutateAsync({
				title: values.title,
				description: values.description || undefined,
				category: values.category,
				condition: values.condition,
				address: values.address,
				location: values.location,
				status: values.status,
				images: imageUrls,
			});

			toast.success("Listing posted!");
			router.push("/dashboard/listings");
		} catch (error) {
			toast.error("Failed to create listing. Please try again.", {
				description: getErrorMessage(error),
			});
		}
	};

	return (
		<View className="flex-1 bg-background">
			<View className="flex-row items-center border-border border-b bg-card px-4 py-3">
				<Pressable
					onPress={() => router.back()}
					className="mr-3 active:opacity-75"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>
				<Text type="h4">New Listing</Text>
			</View>

			<ListingForm onSubmit={handleSubmit} submitLabel="Post Item" />
		</View>
	);
}
