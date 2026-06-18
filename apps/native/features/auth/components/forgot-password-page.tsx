import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, Key, Mail } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { OnboardingLayout } from "./onboarding-layout";
import { OtpVerification } from "./otp-verification";

type Step = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

export function ForgotPasswordPage() {
	const router = useRouter();
	const { toast } = useToast();

	const [step, setStep] = useState<Step>("EMAIL");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSendCode = async () => {
		if (!email?.includes("@")) {
			toast.show({
				variant: "danger",
				label: "Please enter a valid email address.",
			});
			return;
		}

		setIsLoading(true);
		// Simulate API call to send OTP
		setTimeout(() => {
			setIsLoading(false);
			setStep("OTP");
			toast.show({
				variant: "success",
				label: "Verification code sent to your email!",
			});
		}, 1000);
	};

	const handleVerifyCode = (code: string) => {
		setIsLoading(true);
		// Simulate code verification
		setTimeout(() => {
			setIsLoading(false);
			if (code === "1234" || code.length === 4) {
				setStep("RESET");
				toast.show({
					variant: "success",
					label: "Code verified successfully!",
				});
			} else {
				toast.show({
					variant: "danger",
					label: "Invalid verification code. Try again.",
				});
			}
		}, 1000);
	};

	const handleResetPassword = () => {
		if (password.length < 8) {
			toast.show({
				variant: "danger",
				label: "Password must be at least 8 characters long.",
			});
			return;
		}

		if (password !== confirmPassword) {
			toast.show({
				variant: "danger",
				label: "Passwords do not match.",
			});
			return;
		}

		setIsLoading(true);
		// Simulate password reset api call
		setTimeout(() => {
			setIsLoading(false);
			setStep("SUCCESS");
			toast.show({
				variant: "success",
				label: "Password reset completed successfully!",
			});
		}, 1200);
	};

	return (
		<OnboardingLayout description="Resetting your key to the community.">
			<Card className="rounded-2xl border border-border bg-card p-5 shadow-sm">
				{step === "EMAIL" && (
					<View className="gap-5">
						<View>
							<Text type="h3" className="mb-1 font-extrabold text-primary">
								Forgot Password
							</Text>
							<Text type="body-xs" className="text-muted-foreground">
								Enter your email address to receive a 4-digit verification code.
							</Text>
						</View>

						<View className="gap-1.5">
							<Text type="body-xs" className="font-semibold text-foreground">
								Email Address
							</Text>
							<View className="flex-row items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
								<Icon as={Mail} className="size-4 text-muted-foreground" />
								<TextInput
									className="flex-1 p-0 font-medium text-foreground text-sm"
									placeholder="neighbor@example.com"
									placeholderTextColor="#A89880"
									keyboardType="email-address"
									autoCapitalize="none"
									value={email}
									onChangeText={setEmail}
								/>
							</View>
						</View>

						<Button
							size="lg"
							className="items-center justify-center rounded-xl py-3.5"
							onPress={handleSendCode}
							isLoading={isLoading}
							loadingText="Sending..."
						>
							<Button.Label className="font-bold text-white">
								Send Code
							</Button.Label>
						</Button>
					</View>
				)}

				{step === "OTP" && (
					<OtpVerification
						email={email}
						onVerify={handleVerifyCode}
						onResend={handleSendCode}
						onBack={() => setStep("EMAIL")}
						isLoading={isLoading}
						title="Verify Password Reset"
						description={
							<Text
								type="body-xs"
								className="text-muted-foreground leading-relaxed"
							>
								To reset your password, enter the 4-digit code sent to{" "}
								<Text type="body-xs" className="font-bold text-foreground">
									{email}
								</Text>
								. (use code <Text className="font-bold">1234</Text>).
							</Text>
						}
					/>
				)}

				{step === "RESET" && (
					<View className="gap-5">
						<View>
							<Text type="h3" className="mb-1 font-extrabold text-primary">
								Create New Password
							</Text>
							<Text type="body-xs" className="text-muted-foreground">
								Please choose a strong, secure password for your neighbor
								account.
							</Text>
						</View>

						<View className="gap-4">
							<View className="gap-1.5">
								<Text type="body-xs" className="font-semibold text-foreground">
									New Password
								</Text>
								<View className="flex-row items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
									<Icon as={Key} className="size-4 text-muted-foreground" />
									<TextInput
										className="flex-1 p-0 font-medium text-foreground text-sm"
										placeholder="At least 8 characters"
										placeholderTextColor="#A89880"
										secureTextEntry
										autoCapitalize="none"
										value={password}
										onChangeText={setPassword}
									/>
								</View>
							</View>

							<View className="gap-1.5">
								<Text type="body-xs" className="font-semibold text-foreground">
									Confirm Password
								</Text>
								<View className="flex-row items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
									<Icon as={Key} className="size-4 text-muted-foreground" />
									<TextInput
										className="flex-1 p-0 font-medium text-foreground text-sm"
										placeholder="Repeat new password"
										placeholderTextColor="#A89880"
										secureTextEntry
										autoCapitalize="none"
										value={confirmPassword}
										onChangeText={setConfirmPassword}
									/>
								</View>
							</View>
						</View>

						<Button
							size="lg"
							className="items-center justify-center rounded-xl py-3.5"
							onPress={handleResetPassword}
							isLoading={isLoading}
							loadingText="Resetting..."
						>
							<Button.Label className="font-bold text-white">
								Reset Password
							</Button.Label>
						</Button>
					</View>
				)}

				{step === "SUCCESS" && (
					<View className="items-center gap-5 py-4">
						<View className="size-16 items-center justify-center rounded-full bg-primary/10">
							<Icon as={CheckCircle2} className="size-10 text-primary" />
						</View>

						<View className="items-center text-center">
							<Text type="h3" className="mb-1 font-extrabold text-primary">
								Reset Successful
							</Text>
							<Text
								type="body-xs"
								className="px-4 text-center text-muted-foreground"
							>
								Your password has been changed. You can now use your new
								credentials to log back in.
							</Text>
						</View>

						<Button
							size="lg"
							className="w-full items-center justify-center rounded-xl py-3.5"
							onPress={() => router.replace("/login")}
						>
							<Button.Label className="font-bold text-white">
								Go to Log In
							</Button.Label>
						</Button>
					</View>
				)}
			</Card>

			{step !== "SUCCESS" && (
				<View className="mt-6 flex-row items-center justify-center">
					<Pressable
						onPress={() => router.replace("/login")}
						className="flex-row items-center gap-1.5 active:opacity-75"
					>
						<Icon as={ArrowLeft} className="size-4 text-muted-foreground" />
						<Text
							type="body-sm"
							className="font-bold text-muted-foreground text-sm"
						>
							Back to log in
						</Text>
					</Pressable>
				</View>
			)}
		</OnboardingLayout>
	);
}
