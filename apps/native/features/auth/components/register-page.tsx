import { Link, useRouter } from "expo-router";
import { Leaf, ShieldCheck, Users } from "lucide-react-native";
import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { OnboardingLayout } from "./onboarding-layout";
import { OtpVerification } from "./otp-verification";
import { RegisterForm } from "./register-form";

export function RegisterPage() {
	const router = useRouter();
	const { toast } = useToast();

	const [isVerifying, setIsVerifying] = useState(false);
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSuccess = (registeredEmail: string) => {
		setEmail(registeredEmail);
		setIsVerifying(true);
	};

	const handleVerify = (code: string) => {
		setIsLoading(true);
		// Simulate verification
		setTimeout(() => {
			setIsLoading(false);
			if (code === "1234" || code.length === 4) {
				toast.show({
					variant: "success",
					label: "Email verified successfully! Welcome to the porch.",
				});
				router.replace("/");
			} else {
				toast.show({
					variant: "danger",
					label: "Invalid verification code. Try again.",
				});
			}
		}, 1000);
	};

	const handleResend = () => {
		toast.show({
			variant: "success",
			label: "Resending verification code...",
		});
	};

	return (
		<OnboardingLayout description="Open your heart, clear your space.">
			<Card className="rounded-2xl border border-border bg-card p-5 shadow-sm">
				{isVerifying ? (
					<OtpVerification
						email={email}
						onVerify={handleVerify}
						onResend={handleResend}
						onBack={() => setIsVerifying(false)}
						isLoading={isLoading}
					/>
				) : (
					<>
						<Card.Header className="mb-4 p-0">
							<Card.Title>Create your account</Card.Title>
							<Card.Description>
								Join a community of neighbors sharing for good.
							</Card.Description>
						</Card.Header>
						<Card.Body className="p-0">
							<RegisterForm onSuccess={handleSuccess} />
						</Card.Body>
					</>
				)}
			</Card>

			{!isVerifying && (
				<>
					<View className="mt-6 flex-row items-center justify-center">
						<Text className="text-muted-foreground text-sm">
							Already a neighbor?{" "}
						</Text>
						<Link href="/login" asChild>
							<LinkButton size="sm">Log in here</LinkButton>
						</Link>
					</View>

					<View className="flex-row items-center justify-center">
						<Link href="/" asChild>
							<LinkButton size="sm">Continue without an account</LinkButton>
						</Link>
					</View>

					<View className="mt-7 flex-row justify-between gap-1">
						{[
							{ label: "Safe & Secure", icon: ShieldCheck },
							{ label: "Community Verified", icon: Users },
							{ label: "Zero Waste", icon: Leaf },
						].map(({ label, icon }) => (
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
