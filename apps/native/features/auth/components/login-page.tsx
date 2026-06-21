import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { EmailVerificationView } from "./email-verification-view";
import { LoginForm } from "./login-form";
import { OnboardingLayout } from "./onboarding-layout";

export function LoginPage() {
	const [view, setView] = useState<"login" | "verify">("login");
	const [email, setEmail] = useState("");
	const router = useRouter();

	const handleSuccess = () => {
		router.replace("/dashboard");
	};

	return (
		<OnboardingLayout description="Sign in to connect with your community.">
			<View className="px-1">
				{view === "login" ? (
					<>
						<View className="pb-4">
							<Text type="h2" className="text-primary">
								Welcome Back
							</Text>
							<Text type="body-sm" className="mt-1 text-muted-foreground">
								Step back onto the porch and see what's new in your
								neighborhood.
							</Text>
						</View>
						<LoginForm
							onLogin={handleSuccess}
							onUnverifiedEmail={(unverifiedEmail) => {
								setEmail(unverifiedEmail);
								setView("verify");
							}}
						/>
					</>
				) : (
					<EmailVerificationView
						email={email}
						onProceedToLogin={() => setView("login")}
					/>
				)}
			</View>

			{/* Register Link */}
			{view === "login" && (
				<View className="mt-6 flex-row items-center justify-center gap-1">
					<Text type="body-sm" className="text-muted-foreground">
						New to the porch?
					</Text>
					<Link href="/register" asChild>
						<LinkButton size="sm">Join the community</LinkButton>
					</Link>
				</View>
			)}

			{/* Footer */}
			{view === "login" && (
				<View className="mt-8 items-center">
					<Text type="body-xs" className="font-medium text-muted-foreground">
						© 2026 Free on the Porch. All rights reserved.
					</Text>
				</View>
			)}
		</OnboardingLayout>
	);
}
