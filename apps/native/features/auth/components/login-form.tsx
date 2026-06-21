import { loginSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { Link } from "expo-router";
import { ArrowRightIcon, LockIcon, MailIcon } from "lucide-react-native";
import { Button, LinkButton } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

type LoginFormProps = {
	onLogin?: () => void;
	onError?: (error: unknown) => void;
	onUnverifiedEmail?: (email: string) => void;
};

export function LoginForm({
	onLogin,
	onError,
	onUnverifiedEmail,
}: LoginFormProps) {
	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: loginSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			await authClient.signIn.email(value, {
				onError(error) {
					if (error.error?.code === "EMAIL_NOT_VERIFIED") {
						toast.warning({
							title: error.error.message,
							description: "Please verify your email to log in.",
						});
						onUnverifiedEmail?.(value.email);
					} else {
						toast.error(error.error?.message || "Failed to log in");
						onError?.(error);
					}
				},
				onSuccess() {
					formApi.reset();
					toast.success("Welcome back!");
					onLogin?.();
				},
			});
		},
	});

	return (
		<View className="gap-4">
			<form.AppField name="email">
				{(field) => (
					<field.InputField
						label="Email Address"
						placeholder="neighbor@example.com"
						type="email"
						icon={MailIcon}
					/>
				)}
			</form.AppField>
			<form.AppField name="password">
				{(field) => (
					<field.InputField
						type="password"
						icon={LockIcon}
						label={
							<View className="w-full flex-row items-center justify-between pb-0.5">
								<Text className="font-semibold text-foreground text-sm">
									Password
								</Text>
								<Link href="/forgot-password" asChild>
									<LinkButton size="sm">Forgot?</LinkButton>
								</Link>
							</View>
						}
					/>
				)}
			</form.AppField>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						size="lg"
						className="mt-3 w-full"
						isLoading={isSubmitting}
						loadingText="Logging in..."
						onPress={form.handleSubmit}
					>
						Log In
						<Icon as={ArrowRightIcon} className="size-5" />
					</Button>
				)}
			</form.Subscribe>

			{/* Social Divider */}
			<View className="my-4 flex-row items-center gap-3 px-1">
				<Separator className="grow border-border/30 border-t bg-muted" />
				<Text
					type="body-xs"
					className="font-medium text-muted-foreground uppercase tracking-wider"
				>
					Or continue with
				</Text>
				<Separator className="grow border-border/30 border-t bg-muted" />
			</View>

			{/* Social buttons */}
			<View className="flex-row gap-3">
				<Button appearance="outline" color="neutral" className="flex-1">
					Google
				</Button>
				<Button appearance="outline" color="neutral" className="flex-1">
					Apple
				</Button>
			</View>
		</View>
	);
}
