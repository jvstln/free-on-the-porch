import { Stack } from "expo-router";
import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page";

export default function ForgotPasswordRoute() {
	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ForgotPasswordPage />
		</>
	);
}
