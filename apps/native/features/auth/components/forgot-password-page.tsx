import { emailSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react-native";
import { useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";
import { OnboardingLayout } from "./onboarding-layout";

type Step = "EMAIL" | "SUCCESS";

export function ForgotPasswordPage() {
	const router = useRouter();

	const [step, setStep] = useState<Step>("SUCCESS");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: z.object({
				email: emailSchema,
			}),
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			await authClient.requestPasswordReset(
				{
					email: value.email,
					redirectTo: "free-on-the-pouch://reset-password",
				},
				{
					onSuccess() {
						setEmail(value.email);
						setStep("SUCCESS");
						toast.success("Password reset link sent successfully!");
						setIsLoading(false);
					},
					onError(error) {
						toast.error(error.error?.message || "Failed to send reset link.");
						setIsLoading(false);
					},
				},
			);
		},
	});

	const handleResend = async () => {
		setIsLoading(true);
		await authClient.requestPasswordReset(
			{
				email,
				redirectTo: "free-on-the-pouch://reset-password",
			},
			{
				onSuccess() {
					toast.success("Password reset link resent successfully!");
					setIsLoading(false);
				},
				onError(error) {
					toast.error(error.error?.message || "Failed to resend reset link.");
					setIsLoading(false);
				},
			},
		);
	};

	const handleOpenMailApp = () => {
		Linking.openURL("mailto:").catch(() => {
			toast.error("Could not open mail app automatically.");
		});
	};

	return (
		<OnboardingLayout description="Resetting your key to the community.">
			<View className="px-1">
				{step === "EMAIL" && (
					<View className="gap-5">
						<View>
							<Text type="h3" className="mb-1.5 text-primary">
								Forgot Password
							</Text>
							<Text type="body-sm" className="text-muted-foreground">
								Enter your email address below. We'll send you a link to reset
								your password.
							</Text>
						</View>

						<form.AppField name="email">
							{(field) => (
								<field.InputField
									label="Email Address"
									placeholder="neighbor@example.com"
									type="email"
									icon={Mail}
								/>
							)}
						</form.AppField>

						<Button
							size="lg"
							className="mt-1 w-full"
							onPress={form.handleSubmit}
							isLoading={isLoading}
							loadingText="Sending..."
						>
							Send Reset Link
						</Button>
					</View>
				)}

				{step === "SUCCESS" && (
					<View className="items-center gap-5 py-6">
						<View className="size-16 items-center justify-center rounded-full bg-primary/10">
							<Icon as={Mail} className="size-8 text-primary" />
						</View>

						<View className="items-center">
							<Text type="h3" className="mb-2 text-primary">
								Reset Link Sent
							</Text>
							<Text
								type="body-sm"
								className="px-3 text-center text-muted-foreground"
							>
								We've sent a password reset link to{" "}
								<Text type="body-sm" className="font-bold text-foreground">
									{email}
								</Text>
								. Please check your inbox and click the link to reset your
								password.
							</Text>
						</View>

						<View className="mt-2 w-full gap-3">
							<Button size="lg" className="w-full" onPress={handleOpenMailApp}>
								Open Email App
							</Button>

							<Button
								appearance="outline"
								color="neutral"
								size="lg"
								className="w-full"
								onPress={handleResend}
								isLoading={isLoading}
								loadingText="Resending..."
							>
								Resend Link
								<Icon as={RefreshCw} className="ml-1 size-4" />
							</Button>
						</View>
					</View>
				)}
			</View>

			<View className="mt-6 flex-row items-center justify-center">
				<Button
					appearance="ghost"
					color="neutral"
					size="sm"
					onPress={() => router.replace("/login")}
				>
					<Icon as={ArrowLeft} className="size-4 text-muted-foreground" />
					Back to log in
				</Button>
			</View>
		</OnboardingLayout>
	);
}
