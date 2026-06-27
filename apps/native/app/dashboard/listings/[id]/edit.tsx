import { Stack, useLocalSearchParams } from "expo-router";
import { EditListingPage } from "@/features/listings/components/edit-listing-page";

export default function EditListingRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<EditListingPage id={id} />
		</>
	);
}
