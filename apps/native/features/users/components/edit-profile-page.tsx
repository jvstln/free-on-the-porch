import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { KeyboardAvoidingView, ScrollView, View } from "@/components/ui/view";
import { MOCK_USER } from "@/features/mock/mock-data";
import { authClient } from "@/lib/auth-client";
import { useUpdateProfile } from "../hooks/use-user";

const profileFormSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be under 50 characters"),
	bio: z.string().max(200, "Bio must be under 200 characters"),
});

// A nice mock portrait to toggle to when simulating image upload
const MOCK_PORTRAIT =
	"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200";

export function EditProfilePage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useToast();
	const updateMutation = useUpdateProfile();
	const { data: session } = authClient.useSession();

	const user = (session?.user || MOCK_USER) as any;

	const [image, setImage] = useState<string>(user.image || "");

	const handleImagePick = () => {
		// Toggle image simulator
		const nextImage = image === user.image ? MOCK_PORTRAIT : user.image || "";
		setImage(nextImage);
		toast.show({
			variant: "success",
			label: "Simulated profile photo selected!",
		});
	};

	const form = useAppForm({
		defaultValues: {
			name: user.name || "",
			bio: user.bio || "",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: profileFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateMutation.mutateAsync({
					name: value.name,
					bio: value.bio || undefined,
					image: image || undefined,
				});

				toast.show({
					variant: "success",
					label: "Profile updated successfully!",
				});
				router.back();
			} catch (_err) {
				toast.show({
					variant: "danger",
					label: "Failed to save profile changes.",
				});
			}
		},
	});

	return (
		<KeyboardAvoidingView className="flex-1 bg-background">
			{/* Top Header */}
			<View
				className="flex-row items-center border-border border-b bg-card px-4 py-3"
				style={{ paddingTop: Math.max(insets.top, 12) }}
			>
				<Pressable
					onPress={() => router.back()}
					className="mr-3 active:opacity-75"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>
				<Text type="h4" className="font-bold text-foreground">
					Edit Profile
				</Text>
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
			>
				{/* Photo Upload Area */}
				<View className="items-center py-8">
					<TouchableOpacity
						onPress={handleImagePick}
						className="relative active:opacity-90"
					>
						<Avatar className="size-28 rounded-full border-2 border-border/20 bg-muted shadow-sm">
							{image ? (
								<Avatar.Image src={image} />
							) : (
								<Avatar.Fallback>
									{user.name
										?.split(" ")
										.map((w: string) => w[0])
										.join("")
										.toUpperCase() || "NB"}
								</Avatar.Fallback>
							)}
						</Avatar>
						<View className="absolute right-0 bottom-0 size-8 items-center justify-center rounded-full border border-card bg-primary shadow-sm">
							<Icon as={Camera} className="size-4 text-white" />
						</View>
					</TouchableOpacity>
					<Text
						type="body-xs"
						className="mt-3 font-semibold text-muted-foreground"
					>
						Tap to change photo
					</Text>
				</View>

				{/* Input Fields */}
				<View className="mb-8 gap-5">
					<form.AppField name="name">
						{(field) => (
							<field.InputField
								label="Full Name"
								placeholder="Enter your name"
							/>
						)}
					</form.AppField>

					<form.AppField name="bio">
						{(field) => (
							<field.TextareaField
								label="Bio"
								placeholder="Tell neighbors a bit about yourself..."
								numberOfLines={4}
							/>
						)}
					</form.AppField>
				</View>

				{/* Save Changes Button */}
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button
							size="lg"
							className="flex-row items-center justify-center gap-2 rounded-xl py-4"
							onPress={form.handleSubmit}
							isLoading={isSubmitting || updateMutation.isPending}
							loadingText="Saving changes..."
						>
							<Icon as={Check} className="size-5 text-white" />
							<Button.Label className="font-bold text-base text-white">
								Save Changes
							</Button.Label>
						</Button>
					)}
				</form.Subscribe>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
