import { usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getIsPublicPage } from "../auth.util";
import { OnboardingSheet } from "./onboarding-sheet";

export function AuthGuard({ children }: { children: React.ReactNode }) {
	const session = authClient.useSession();
	const pathname = usePathname();
	const router = useRouter();

	const isPublic = getIsPublicPage(pathname);
	const isAuthenticated = !!session.data;

	const isLoading = session.isPending && !isPublic;
	useEffect(() => {
		if (!isLoading) {
			SplashScreen.hide();
		}
	}, [isLoading]);

	if (isPublic || isAuthenticated) return children;

	if (session.isPending) {
		return null; // Keep native splash screen showing by returning empty view under it
	}

	return (
		<OnboardingSheet
			isOpen={true}
			onOpenChange={(open) => {
				if (!open) {
					router.replace("/dashboard");
				}
			}}
		/>
	);
}
