import { passwordSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Key } from "lucide-react-native";
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

const resetFormSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type Step = "FORM" | "SUCCESS";

export function ResetPasswordPage() {
	const router = useRouter();
	const { token } = useLocalSearchParams();

	const [step, setStep] = useState<Step>("FORM");
	const [isLoading, setIsLoading] = useState(false);

	const form = useAppForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: resetFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!token || typeof token !== "string") {
				toast.error("Invalid reset token. Please request a new link.");
				return;
			}

			setIsLoading(true);
			await authClient.resetPassword(
				{
					newPassword: value.password,
					token: token,
				},
				{
					onSuccess() {
						setStep("SUCCESS");
						toast.success("Password reset completed successfully!");
						setIsLoading(false);
					},
					onError(error) {
						toast.error(
							error.error?.message ||
								"Failed to reset password. Link might be expired.",
						);
						setIsLoading(false);
					},
				},
			);
		},
	});

	const hasTokenError = !token || typeof token !== "string";

	return (
		<OnboardingLayout description="Resetting your key to the community.">
			<View className="px-1">
				{hasTokenError ? (
					<View className="items-center gap-5 py-6">
						<View className="size-16 items-center justify-center rounded-full bg-destructive/10">
							<Icon as={AlertTriangle} className="size-8 text-destructive" />
						</View>

						<View className="items-center">
							<Text type="h3" className="mb-2 text-destructive">
								Invalid Reset Link
							</Text>
							<Text
								type="body-sm"
								className="px-4 text-center text-muted-foreground"
							>
								This password reset link is invalid, expired, or has already
								been used. Please request a new password reset link.
							</Text>
						</View>

						<Button
							size="lg"
							className="mt-2 w-full"
							onPress={() => router.replace("/forgot-password")}
						>
							Request New Link
						</Button>
					</View>
				) : step === "FORM" ? (
					<View className="gap-5">
						<View>
							<Text type="h3" className="mb-1.5 text-primary">
								Create New Password
							</Text>
							<Text type="body-sm" className="text-muted-foreground">
								Please choose a strong, secure password for your neighbor
								account.
							</Text>
						</View>

						<View className="gap-4">
							<form.AppField name="password">
								{(field) => (
									<field.InputField
										type="password"
										label="New Password"
										placeholder="At least 8 characters"
										icon={Key}
									/>
								)}
							</form.AppField>

							<form.AppField name="confirmPassword">
								{(field) => (
									<field.InputField
										type="password"
										label="Confirm Password"
										placeholder="Repeat new password"
										icon={Key}
									/>
								)}
							</form.AppField>
						</View>

						<Button
							size="lg"
							className="mt-1 w-full"
							onPress={form.handleSubmit}
							isLoading={isLoading}
							loadingText="Resetting..."
						>
							Reset Password
						</Button>
					</View>
				) : (
					<View className="items-center gap-5 py-6">
						<View className="size-16 items-center justify-center rounded-full bg-primary/10">
							<Icon as={CheckCircle2} className="size-8 text-primary" />
						</View>

						<View className="items-center">
							<Text type="h3" className="mb-2 text-primary">
								Reset Successful
							</Text>
							<Text
								type="body-sm"
								className="px-4 text-center text-muted-foreground"
							>
								Your password has been changed. You can now use your new
								credentials to log back in.
							</Text>
						</View>

						<Button
							size="lg"
							className="mt-2 w-full"
							onPress={() => router.replace("/login")}
						>
							Go to Log In
						</Button>
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
