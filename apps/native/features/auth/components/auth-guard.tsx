import { Redirect, usePathname, useRouter } from "expo-router";
import { LoadingScreen } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { getIsPublicPage } from "../auth.service";
import { OnboardingSheet } from "./onboarding-sheet";

export function AuthGuard({ children }: { children: React.ReactNode }) {
	const session = authClient.useSession();
	const pathname = usePathname();
	const router = useRouter();

	const isPublic = getIsPublicPage(pathname);
	const isAuthenticated = !!session.data;

	if (session.isPending) {
		return <LoadingScreen />;
	}

	// 1. Authenticated user visiting public landing pages (login/register/index) -> redirect to dashboard
	if (
		isAuthenticated &&
		(pathname === "/login" || pathname === "/register" || pathname === "/")
	) {
		return <Redirect href="/dashboard" />;
	}

	// 2. Unauthenticated user visiting public page -> render page directly
	// 3. Authenticated user visiting protected page -> render page directly
	if ((isPublic && !isAuthenticated) || isAuthenticated) {
		return children;
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
