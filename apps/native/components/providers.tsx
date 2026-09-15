import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AuthGuardProvider } from "@/features/auth/components/auth-guard";
import { AuthSheetProvider } from "@/features/auth/components/auth-sheet-provider";
import { queryClient } from "@/lib/query-client";
import { ToastListener } from "./ui/toast";
import { SafeAreaView } from "./ui/view";

export const RootProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<QueryClientProvider client={queryClient}>
					<HeroUINativeProvider>
						<ToastListener />
						<SafeAreaView
							edges={["top", "left", "right"]}
							className="flex-1 bg-background"
						>
							<AuthGuardProvider>{children}</AuthGuardProvider>
							<AuthSheetProvider />
						</SafeAreaView>
					</HeroUINativeProvider>
				</QueryClientProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
};
