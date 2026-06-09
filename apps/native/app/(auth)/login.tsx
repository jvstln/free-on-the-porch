import logoIconLight from "@free-on-the-porch/assets/logo-icon-light.svg";
import { loginSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { Link, useRouter } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { KeyboardAvoidingView, ScrollView, View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

export default function Login() {
	const router = useRouter();
	const { toast } = useToast();

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
					toast.show({
						variant: "danger",
						label: error.error?.message || "Failed to log in",
					});
				},
				onSuccess() {
					formApi.reset();
					toast.show({
						variant: "success",
						label: "Welcome back!",
					});
					router.replace("/dashboard");
				},
			});
		},
	});

	return (
		<KeyboardAvoidingView className="flex-1 bg-background">
			<ScrollView contentContainerClassName="justify-center grow px-4 py-8">
				{/* Top Header */}
				<View className="mb-8 items-center text-center">
					<View className="mb-4 size-12 items-center justify-center rounded-full bg-primary shadow-sm">
						<Image
							source={logoIconLight}
							className="size-7"
							contentFit="contain"
						/>
					</View>
					<Text type="h1" className="mb-2 text-primary">
						Free on the Porch
					</Text>
				</View>

				<Card>
					<Card.Header>
						<Card.Title>Welcome Back</Card.Title>
						<Card.Description>
							<Text type="body-sm">
								Step back onto the porch and see what's new in your
								neighborhood.
							</Text>
						</Card.Description>
					</Card.Header>
					<Card.Body className="gap-4">
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
											<LinkButton size="sm">Forgot Password?</LinkButton>
										</View>
									}
								/>
							)}
						</form.AppField>
					</Card.Body>
					<Card.Footer className="gap-4">
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button
									size="lg"
									isLoading={isSubmitting}
									loadingText="Logging in..."
									onPress={form.handleSubmit}
								>
									<Button.Label>Log In</Button.Label>
									<Icon as={ArrowRightIcon} />
								</Button>
							)}
						</form.Subscribe>
					</Card.Footer>
				</Card>

				{/* Divider */}
				<View className="my-5 flex-row items-center gap-3">
					<Separator className="grow" />
					<Text type="body-xs">Or continue with</Text>
					<Separator className="grow" />
				</View>

				{/* Social Login Buttons */}
				<View className="flex-row gap-3">
					<Button variant="outline" className="flex-1">
						Google
					</Button>
					<Button variant="outline" className="flex-1">
						Apple
					</Button>
				</View>

				{/* Register Link */}
				<View className="mt-6 flex-row items-center justify-center text-sm">
					<Text className="text-muted-foreground">New to the porch? </Text>
					<Link href="/register" asChild>
						<LinkButton size="sm">Join the community</LinkButton>
					</Link>
				</View>

				{/* Footer */}
				<View className="mt-8 items-center">
					<Text className="text-muted-foreground text-xs">
						© 2024 Free on the Porch. All rights reserved.
					</Text>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
