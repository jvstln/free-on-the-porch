import {
	focusManager,
	onlineManager,
	QueryClient,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState, type AppStateStatus, Platform } from "react-native";

// ─── Online manager — expo-network aware ─────────────────────────────────────

onlineManager.setEventListener((setOnline) => {
	let initialised = false;

	const subscription = Network.addNetworkStateListener((state) => {
		initialised = true;
		setOnline(!!state.isConnected);
	});

	Network.getNetworkStateAsync()
		.then((state) => {
			if (!initialised) setOnline(!!state.isConnected);
		})
		.catch(() => {});

	return subscription.remove;
});

// ─── Focus manager — refetch when app comes to foreground ────────────────────

function onAppStateChange(status: AppStateStatus) {
	if (Platform.OS !== "web") {
		focusManager.setFocused(status === "active");
	}
}

AppState.addEventListener("change", onAppStateChange);

// ─── QueryClient ──────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 1000 * 60, // 1 minute
			gcTime: 1000 * 60 * 5, // 5 minutes
		},
		mutations: {
			retry: 0,
		},
	},
});
