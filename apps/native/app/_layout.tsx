import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";

export const unstable_settings = {
	initialRouteName: "(drawer)",
};

function StackLayout() {
	return (
		<Stack screenOptions={{}}>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="dashboard" options={{ headerShown: false }} />
			{/* <Stack.Screen
        name="modal"
        options={{ title: "Modal", presentation: "modal" }}
      /> */}
		</Stack>
	);
}

export default function Layout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<AppThemeProvider>
					<HeroUINativeProvider>
						<StackLayout />
					</HeroUINativeProvider>
					<PortalHost />
				</AppThemeProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}
