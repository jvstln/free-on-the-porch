import type { CreateListingDto } from "@free-on-the-porch/shared/schemas";
import { getErrorMessage } from "@free-on-the-porch/shared/utils";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { useCreateListing } from "../hooks/use-listings";
import { ListingForm } from "./listing-form";

export function CreateListingPage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const createMutation = useCreateListing();

	const handleSubmit = async (
		values: CreateListingDto & { photos: { uri: string }[] },
	) => {
		try {
			await createMutation.mutateAsync({
				data: {
					title: values.title,
					description: values.description || undefined,
					category: values.category,
					condition: values.condition,
					address: values.address,
					location: values.location,
					status: values.status,
				},
				photos: values.photos.length > 0 ? values.photos : undefined,
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
			<View
				className="flex-row items-center border-border border-b bg-card px-4 pb-3"
				style={{ paddingTop: Math.max(insets.top, 12) }}
			>
				<Pressable
					onPress={() => router.back()}
					className="mr-3 active:opacity-75"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>
				<Text type="h4" className="font-bold text-foreground">
					New Listing
				</Text>
			</View>

			<ListingForm
				onSubmit={handleSubmit}
				isSubmitting={createMutation.isPending}
				submitLabel="Post Item"
			/>
		</View>
	);
}
