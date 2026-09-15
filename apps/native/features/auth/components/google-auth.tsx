import { env } from "@free-on-the-porch/env/public";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import {
	GoogleOneTapSignIn,
	GoogleSignInButton,
	type OneTapSuccessData,
} from "react-native-nitro-google-signin";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { useGlobalStore } from "@/store/global.store";
import { useAppTheme } from "@/store/theme.store";

GoogleOneTapSignIn.configure({
	webClientId: env.PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "autoDetect",
});

export const GoogleAuthButton = () => {
	const { currentTheme } = useAppTheme();
	const view = useGlobalStore((state) => state.authSheetView);
	const setView = useGlobalStore((state) => state.setAuthSheetView);

	const authClientGoogleSignIn = useMutation({
		mutationFn: async ({ idToken }: OneTapSuccessData) => {
			await authClient.signIn.social({
				provider: "google",
				idToken: {
					token: idToken,
				},
			});
		},
		onSuccess: () => {
			toast.success("Login successful");
			if (view) setView(null);
			else router.navigate("/");
		},
		onError: () => {
			toast.error("Failed to sign in using google");
		},
	});

	return (
		<GoogleSignInButton
			colorScheme={currentTheme}
			size="wide"
			style={{ width: "100%" }}
			signInBehavior="buttonFlow"
			onSignInSuccess={(data) => {
				authClientGoogleSignIn.mutate(data);
			}}
			loading={authClientGoogleSignIn.isPending}
			disabled={authClientGoogleSignIn.isPending}
			onSignInError={(e) => {
				toast.error("Failed to sign in using google");
				console.error(e);
			}}
		/>
	);
};
