import { env } from "@free-on-the-porch/env/native";
import { registerSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { ArrowRightIcon, LockIcon, MailIcon, UserIcon } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

type RegisterFormProps = {
	onRegister: (email: string) => void;
	onError?: (error: unknown) => void;
};

export function RegisterForm({ onRegister, onError }: RegisterFormProps) {
	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			agreed: false,
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: registerSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			await authClient.signUp.email(
				{
					name: value.name,
					email: value.email,
					password: value.password,
					callbackURL: "free-on-the-pouch://dashboard",
				},
				{
					onError(error) {
						console.log("registration error", error.error);
						toast.error(error.error?.message || "Failed to sign up");
						onError?.(error);
					},
					onSuccess(ctx) {
						console.log("registration success", ctx.data);
						toast.success("Account created! Please verify your email.");
						onRegister(value.email);
						formApi.reset();
					},
				},
			);
		},
	});

	return (
		<View className="gap-4">
			<form.AppField name="name">
				{(field) => (
					<field.InputField
						label="Full name"
						placeholder="Neighbor Name"
						icon={UserIcon}
					/>
				)}
			</form.AppField>
			<form.AppField name="email">
				{(field) => (
					<field.InputField
						label="Email address"
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
						label="Password"
						placeholder="At least 8 characters"
						icon={LockIcon}
					/>
				)}
			</form.AppField>
			<form.AppField name="agreed">
				{(field) => (
					<field.CheckboxField label="I agree to respect the neighborhood rules." />
				)}
			</form.AppField>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						size="lg"
						className="mt-2 w-full"
						isLoading={isSubmitting}
						loadingText="Joining..."
						onPress={form.handleSubmit}
					>
						Join neighbor
						<Icon as={ArrowRightIcon} className="size-5" />
					</Button>
				)}
			</form.Subscribe>

			{/* Social Divider */}
			<View className="my-3 flex-row items-center gap-3 px-1">
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
