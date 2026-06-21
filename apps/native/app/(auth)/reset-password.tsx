import { Stack } from "expo-router";
import { ResetPasswordPage } from "@/features/auth/components/reset-password-page";

export default function ResetPasswordRoute() {
	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ResetPasswordPage />
		</>
	);
}
