import { Stack, useLocalSearchParams } from "expo-router";
import { ListingDetailPage } from "@/features/listings/components/listing-detail-page";

export default function DashboardListingDetailRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ListingDetailPage id={id} />
		</>
	);
}
