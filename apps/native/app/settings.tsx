import { Stack } from "expo-router";
import { SettingsPage } from "@/features/users/components/settings-page";

export default function SettingsRoute() {
	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<SettingsPage />
		</>
	);
}
