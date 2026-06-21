import * as Linking from "expo-linking";
import { ArrowRightIcon, MailIcon, RefreshCwIcon } from "lucide-react-native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

type EmailVerificationViewProps = {
	email: string;
	onProceedToLogin: () => void;
};

export function EmailVerificationView({
	email,
	onProceedToLogin,
}: EmailVerificationViewProps) {
	const [resending, setResending] = useState(false);

	const handleResend = async () => {
		setResending(true);
		await authClient.sendVerificationEmail(
			{
				email,
				callbackURL: "free-on-the-pouch://dashboard",
			},
			{
				onSuccess() {
					toast.success("Verification link sent successfully!");
					setResending(false);
				},
				onError(error) {
					toast.error(
						error.error?.message || "Failed to resend verification link.",
					);
					setResending(false);
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
		<View className="items-center gap-5 py-4">
			<View className="size-16 items-center justify-center rounded-full bg-primary/10">
				<Icon as={MailIcon} className="size-8 text-primary" />
			</View>

			<View className="items-center">
				<Text type="h3" className="mb-2 text-center text-primary">
					Verify your email
				</Text>
				<Text type="body-sm" className="px-3 text-center text-muted-foreground">
					We've sent a verification link to{" "}
					<Text type="body-sm" className="font-bold text-foreground">
						{email}
					</Text>
					. Please check your inbox and click the link to verify your account
					and sign in.
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
					isLoading={resending}
					loadingText="Resending..."
				>
					Resend Email
					<Icon as={RefreshCwIcon} className="ml-1 size-4" />
				</Button>
			</View>

			<View className="mt-4 flex-row justify-center gap-4">
				<Button
					appearance="ghost"
					color="neutral"
					size="sm"
					onPress={onProceedToLogin}
				>
					Proceed to Login
					<Icon
						as={ArrowRightIcon}
						className="ml-1 size-4 text-muted-foreground"
					/>
				</Button>
			</View>
		</View>
	);
}
