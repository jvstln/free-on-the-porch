import logoIconLight from "@free-on-the-porch/assets/logo-icon-light.svg";
import { registerSchema } from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { Link, useRouter } from "expo-router";
import { Leaf, ShieldCheck, Users } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { KeyboardAvoidingView, ScrollView, View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

export default function Register() {
	const router = useRouter();
	const { toast } = useToast();

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			agreed: false,
			// name: "John",
			// email: "doe@gmail.com",
			// password: "Pass@1234",
			// agreed: true,
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: registerSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			await authClient.signUp.email(value, {
				onError(error) {
					toast.show({
						variant: "danger",
						label: error.error?.message || "Failed to sign up",
					});
				},
				onSuccess() {
					formApi.reset();
					toast.show({
						variant: "success",
						label: "Account created successfully",
					});
					router.replace("/");
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
					<Text type="body-sm">Open your heart, clear your space.</Text>
				</View>

				{/* Form Card */}
				<Card>
					<Card.Header>
						<Card.Title>Create your account</Card.Title>
						<Card.Description>
							Join a community of neighbors sharing for good.
						</Card.Description>
					</Card.Header>

					<Card.Body className="gap-4">
						<form.AppField name="name">
							{(field) => <field.InputField label="Full name" />}
						</form.AppField>

						<form.AppField name="email">
							{(field) => (
								<field.InputField
									label="Email address"
									placeholder="example@gmail.com"
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
								<field.CheckboxField
									label={
										<Text
											type="body-sm"
											className="flex-row items-baseline gap-1"
										>
											I agree to follow the{" "}
											<Link href="/" className="text-primary underline">
												Community Guidelines
											</Link>{" "}
											and be a respectful neighbor.
										</Text>
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
									loadingText="Joining..."
									onPress={form.handleSubmit}
								>
									Join the Community
								</Button>
							)}
						</form.Subscribe>
					</Card.Footer>

					<View className="mt-6 flex-row items-center justify-center">
						<Text className="text-muted-foreground text-sm">
							Already a neighbor?{" "}
						</Text>
						<Link href="/login" asChild>
							<Text className="font-semibold text-primary text-sm underline">
								Log in here
							</Text>
						</Link>
					</View>
				</Card>

				{/* Safe & Secure Bottom badges */}
				<View className="mt-10 flex-row justify-center gap-6 opacity-70">
					<View className="flex-row items-center gap-1.5">
						<Icon as={ShieldCheck} className="size-4 text-muted-foreground" />
						<Text className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
							Safe & Secure
						</Text>
					</View>
					<View className="flex-row items-center gap-1.5">
						<Icon as={Users} className="size-4 text-muted-foreground" />
						<Text className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
							Community Verified
						</Text>
					</View>
					<View className="flex-row items-center gap-1.5">
						<Icon as={Leaf} className="size-4 text-muted-foreground" />
						<Text className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
							Zero Waste
						</Text>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
