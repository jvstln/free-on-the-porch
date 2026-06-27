import { Stack } from "expo-router";
import { EditProfilePage } from "@/features/users/components/edit-profile-page";

export default function EditProfileRoute() {
	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<EditProfilePage />
		</>
	);
}
