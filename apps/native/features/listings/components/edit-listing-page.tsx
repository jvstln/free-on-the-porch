import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";
import { useListingDetail, useUpdateListing } from "../hooks/use-listings";
import { ListingForm } from "./listing-form";

type Props = {
	id: string;
};

export function EditListingPage({ id }: Props) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useToast();
	const { data: session } = authClient.useSession();

	const { data: listing, isLoading, error } = useListingDetail(id);
	const updateMutation = useUpdateListing(id);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner className="size-8 text-primary" />
				<Text type="body-sm" className="mt-4 text-muted-foreground">
					Fetching listing details...
				</Text>
			</View>
		);
	}

	if (error || !listing) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Text type="h4" className="mb-2 font-bold text-foreground">
					Listing Not Found
				</Text>
				<Text type="body-sm" className="mb-6 text-center text-muted-foreground">
					We couldn't retrieve the listing information.
				</Text>
				<Button onPress={() => router.back()} variant="primary">
					<Button.Label>Go Back</Button.Label>
				</Button>
			</View>
		);
	}

	// Safety check: is the current user the owner?
	const isOwner = session?.user?.id === listing.userId;
	if (!isOwner) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Text type="h4" className="mb-2 font-bold text-foreground">
					Access Denied
				</Text>
				<Text type="body-sm" className="mb-6 text-center text-muted-foreground">
					You do not have permission to edit this listing.
				</Text>
				<Button onPress={() => router.back()} variant="primary">
					<Button.Label>Go Back</Button.Label>
				</Button>
			</View>
		);
	}

	const handleSubmit = async (values: any) => {
		try {
			await updateMutation.mutateAsync({
				title: values.title,
				description: values.description || undefined,
				category: values.category,
				condition: values.condition,
				status: values.status,
			});

			toast.show({
				variant: "success",
				label: "Listing updated successfully!",
			});

			router.back();
		} catch (_err) {
			toast.show({
				variant: "danger",
				label: "Failed to update listing. Please try again.",
			});
		}
	};

	return (
		<View className="flex-1 bg-background">
			{/* Top Header */}
			<View
				className="flex-row items-center border-border border-b bg-card px-4 py-3"
				style={{ paddingTop: Math.max(insets.top, 12) }}
			>
				<Pressable
					onPress={() => router.back()}
					className="mr-3 active:opacity-75"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>
				<Text type="h4" className="font-bold text-foreground">
					Edit Listing
				</Text>
			</View>

			<ListingForm
				initialValues={{
					title: listing.title,
					description: listing.description || "",
					category: listing.category,
					condition: listing.condition,
					status: listing.status,
				}}
				onSubmit={handleSubmit}
				isSubmitting={updateMutation.isPending}
				submitLabel="Save Changes"
				showStatusSelector={true}
			/>
		</View>
	);
}
