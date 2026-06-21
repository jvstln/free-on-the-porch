import { Link, useRouter } from "expo-router";
import { Leaf, ShieldCheck, Users } from "lucide-react-native";
import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { EmailVerificationView } from "./email-verification-view";
import { OnboardingLayout } from "./onboarding-layout";
import { RegisterForm } from "./register-form";

const TRUST_BADGES = [
	{ label: "Safe & Secure", icon: ShieldCheck },
	{ label: "Community Verified", icon: Users },
	{ label: "Zero Waste", icon: Leaf },
] as const;

export function RegisterPage() {
	const [state, setState] = useState<"register" | "verify">("register");
	const [email, setEmail] = useState("");
	const router = useRouter();

	return (
		<OnboardingLayout description="Open your heart, clear your space.">
			<View className="px-1">
				{state === "register" ? (
					<>
						<View className="pb-4">
							<Text type="h2" className="text-primary">
								Create your account
							</Text>
							<Text type="body-sm" className="mt-1 text-muted-foreground">
								Join a community of neighbors sharing for good.
							</Text>
						</View>
						<RegisterForm
							onRegister={(regEmail) => {
								setEmail(regEmail);
								setState("verify");
							}}
						/>
					</>
				) : (
					<EmailVerificationView
						email={email}
						onProceedToLogin={() => router.replace("/login")}
					/>
				)}
			</View>

			{state === "register" && (
				<>
					<View className="mt-6 flex-row items-center justify-center gap-1">
						<Text type="body-sm" className="text-muted-foreground">
							Already a neighbor?
						</Text>
						<Link href="/login" asChild>
							<LinkButton size="sm">Log in here</LinkButton>
						</Link>
					</View>

					<View className="mt-1 flex-row items-center justify-center">
						<Link href="/dashboard" asChild>
							<LinkButton size="sm">Continue without an account</LinkButton>
						</Link>
					</View>

					<View className="mt-7 flex-row justify-between gap-1 px-1">
						{TRUST_BADGES.map(({ label, icon }) => (
							<View key={label} className="flex-row items-center gap-1.5">
								<Icon as={icon} className="size-4 text-muted-foreground" />
								<Text className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
									{label}
								</Text>
							</View>
						))}
					</View>
				</>
			)}
		</OnboardingLayout>
	);
}

