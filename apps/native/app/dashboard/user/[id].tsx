import { Stack, useLocalSearchParams } from "expo-router";
import { PublicProfilePage } from "@/features/users/components/public-profile-page";

export default function PublicProfileRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<PublicProfilePage id={id} />
		</>
	);
}
