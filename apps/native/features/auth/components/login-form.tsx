import { loginSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { Link } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { Button, LinkButton } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

type LoginFormProps = {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
};

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
	const { toast } = useToast();

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
			// email: "johndoe@gmail.com",
			// password: "Pass@1234",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: loginSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			await authClient.signIn.email(value, {
				onError(error) {
					toast.show({
						variant: "danger",
						label: error.error?.message || "Failed to log in",
					});
					onError?.(error);
				},
				onSuccess() {
					formApi.reset();
					toast.show({
						variant: "success",
						label: "Welcome back!",
					});
					onSuccess?.();
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
					/>
				)}
			</form.AppField>
			<form.AppField name="password">
				{(field) => (
					<field.InputField
						type="password"
						label={
							<View className="w-full flex-row items-center justify-between">
								<Text>Password</Text>
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
						className="mt-2 items-center justify-center"
						isLoading={isSubmitting}
						loadingText="Logging in..."
						onPress={form.handleSubmit}
					>
						<Button.Label>Log In</Button.Label>
						<Icon as={ArrowRightIcon} />
					</Button>
				)}
			</form.Subscribe>

			<View className="flex-row items-center justify-center gap-1">
				<Text type="body-sm">Don't have an account?</Text>
				<Link href="/register" asChild>
					<LinkButton size="sm">Sign Up</LinkButton>
				</Link>
			</View>

			{/* Social Divider */}
			<View className="my-5 flex-row items-center gap-3">
				<Separator className="grow" />
				<Text type="body-xs">Or continue with</Text>
				<Separator className="grow" />
			</View>

			{/* Social buttons */}
			<View className="flex-row gap-3">
				<Button
					variant="outline"
					appearance="outline"
					color="neutral"
					className="flex-1"
				>
					Google
				</Button>
				<Button
					variant="outline"
					appearance="outline"
					color="neutral"
					className="flex-1"
				>
					Apple
				</Button>
			</View>
		</View>
	);
}
