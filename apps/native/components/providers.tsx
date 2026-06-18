import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { queryClient } from "@/lib/query-client";
import { SafeAreaView } from "./ui/view";

export const RootProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<AppThemeProvider>
					<HeroUINativeProvider>
						<QueryClientProvider client={queryClient}>
							<SafeAreaView className="flex-1">
								<AuthGuard>{children}</AuthGuard>
							</SafeAreaView>
						</QueryClientProvider>
					</HeroUINativeProvider>
				</AppThemeProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
};
