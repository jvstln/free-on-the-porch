import { Link, useRouter } from "expo-router";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { LoginForm } from "./login-form";
import { OnboardingLayout } from "./onboarding-layout";

export function LoginPage() {
	const router = useRouter();

	const handleSuccess = () => {
		router.replace("/dashboard");
	};

	return (
		<OnboardingLayout>
			<Card>
				<Card.Header>
					<Card.Title>Welcome Back</Card.Title>
					<Card.Description>
						<Text type="body-sm" className="text-muted-foreground">
							Step back onto the porch and see what's new in your neighborhood.
						</Text>
					</Card.Description>
				</Card.Header>
				<Card.Body>
					<LoginForm onSuccess={handleSuccess} />
				</Card.Body>
			</Card>

			{/* Register Link */}
			<View className="mt-6 flex-row items-center justify-center text-sm">
				<Text className="text-muted-foreground text-sm">
					New to the porch?{" "}
				</Text>
				<Link href="/register" asChild>
					<LinkButton size="sm">Join the community</LinkButton>
				</Link>
			</View>

			{/* Footer */}
			<View className="mt-8 items-center">
				<Text className="text-muted-foreground text-xs">
					© 2024 Free on the Porch. All rights reserved.
				</Text>
			</View>
		</OnboardingLayout>
	);
}
