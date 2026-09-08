import "@/global.css";
import { Stack } from "expo-router";
import { RootProviders } from "@/components/providers";

export const unstable_settings = {
	initialRouteName: "(auth)",
};

function StackLayout() {
	return (
		<Stack screenOptions={{}}>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="dashboard" options={{ headerShown: false }} />
			<Stack.Screen name="(modal)" options={{ headerShown: false }} />
		</Stack>
	);
}

export default function Layout() {
	return (
		<RootProviders>
			<StackLayout />
		</RootProviders>
	);
}
