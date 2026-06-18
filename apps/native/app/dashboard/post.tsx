import { useRouter } from "expo-router";
import { Header } from "@/components/header";
import { useToast } from "@/components/ui/toast";
import { SafeAreaView } from "@/components/ui/view";
import { ListingForm } from "@/features/listings/components/listing-form";
import { useCreateListing } from "@/features/listings/hooks/use-listings";

export default function PostScreen() {
	const router = useRouter();
	const { toast } = useToast();
	const createMutation = useCreateListing();

	const handleSubmit = async (values: any) => {
		try {
			await createMutation.mutateAsync({
				title: values.title,
				description: values.description || undefined,
				category: values.category,
				condition: values.condition,
				lat: 40.7312,
				lng: -74.2738, // Default Maplewood coordinates
				address: "124 Maple Terrace, Maplewood",
			});

			toast.show({
				variant: "success",
				label: "Your item is live on the porch!",
			});

			// Redirect back to Explore feed
			router.replace("/dashboard");
		} catch (_err) {
			toast.show({
				variant: "danger",
				label: "Failed to create listing. Please try again.",
			});
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Header />
			<ListingForm
				onSubmit={handleSubmit}
				isSubmitting={createMutation.isPending}
				submitLabel="Post Item"
			/>
		</SafeAreaView>
	);
}
