import { registerSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { ArrowRightIcon } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

type RegisterFormProps = {
	onSuccess?: (email: string) => void;
	onError?: (error: unknown) => void;
};

export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
	const { toast } = useToast();

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
				},
				{
					onError(error) {
						toast.show({
							variant: "danger",
							label: error.error?.message || "Failed to sign up",
						});
						onError?.(error);
					},
					onSuccess() {
						toast.show({
							variant: "success",
							label: "Account created successfully!",
						});
						onSuccess?.(value.email);
						formApi.reset();
					},
				},
			);
		},
	});

	return (
		<View className="gap-4">
			<form.AppField name="name">
				{(field) => <field.InputField label="Full name" />}
			</form.AppField>
			<form.AppField name="email">
				{(field) => (
					<field.InputField
						label="Email address"
						placeholder="example@gmail.com"
						type="email"
					/>
				)}
			</form.AppField>
			<form.AppField name="password">
				{(field) => (
					<field.InputField
						type="password"
						label="Password"
						placeholder="At least 8 characters"
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
						className="mt-2 items-center justify-center"
						isLoading={isSubmitting}
						loadingText="Joining..."
						onPress={form.handleSubmit}
					>
						Join neighbor
						<Icon as={ArrowRightIcon} />
					</Button>
				)}
			</form.Subscribe>

			{/* Social Divider */}
			<View className="my-5 flex-row items-center gap-3">
				<Separator className="grow" />
				<Text type="body-xs">Or continue with</Text>
				<Separator className="grow" />
			</View>

			{/* Social buttons */}
			<View className="flex-row gap-3">
				<Button variant="outline" className="flex-1 justify-center">
					Google
				</Button>
				<Button variant="outline" className="flex-1 justify-center">
					Apple
				</Button>
			</View>
		</View>
	);
}
