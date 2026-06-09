import { revalidateLogic } from "@tanstack/react-form";
import {
	Camera,
	Compass,
	Image as ImageIcon,
	MapPin,
	Plus,
	Send,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import {
	KeyboardAvoidingView,
	SafeAreaView,
	ScrollView,
	View,
} from "@/components/ui/view";
import { cn } from "@/lib/utils";

const MAP_MOCK =
	"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/pickup_map_mock_1780101925282.png";

const CATEGORIES = ["Furniture", "Kitchen", "Kids", "Garden", "Books", "Other"];

export default function PostScreen() {
	const { toast } = useToast();
	const [activeCategory, setActiveCategory] = useState("Furniture");

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			curbsidePickup: true,
			porchPickup: false,
		},
		validationLogic: revalidateLogic(),
		onSubmit: async ({ value, formApi }) => {
			toast.show({
				variant: "success",
				label: "Your item is live on the porch!",
			});
			formApi.reset();
			setActiveCategory("Furniture");
		},
	});

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Header />

			<KeyboardAvoidingView className="flex-1">
				<ScrollView className="flex-1 px-5">
					{/* Add Photos Section */}
					<View className="mb-6">
						<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
							Add Photos
						</Text>
						<View className="flex-row gap-3">
							<TouchableOpacity className="aspect-square flex-1 items-center justify-center rounded-2xl border border-[#c1c9bf] border-dashed bg-[#efeee9]/30 py-4">
								<Icon as={Camera} className="mb-1 size-6 text-primary" />
								<Text type="body-xs" className="font-bold text-[#414942]">
									Camera
								</Text>
							</TouchableOpacity>

							<TouchableOpacity className="aspect-square flex-1 items-center justify-center rounded-2xl border border-[#c1c9bf] border-dashed bg-[#efeee9]/30 py-4">
								<Icon as={ImageIcon} className="mb-1 size-6 text-primary" />
								<Text type="body-xs" className="font-bold text-[#414942]">
									Gallery
								</Text>
							</TouchableOpacity>

							<TouchableOpacity className="aspect-square flex-1 items-center justify-center rounded-2xl bg-[#efeee9]/50 py-4">
								<Icon as={Plus} className="size-8 text-[#c1c9bf]" />
							</TouchableOpacity>
						</View>
					</View>

					{/* TanStack Form Fields */}
					<View className="mb-6 gap-5">
						<form.AppField name="title">
							{(field) => (
								<field.InputField
									label="Title"
									placeholder="What are you giving away?"
								/>
							)}
						</form.AppField>

						{/* Description */}
						<form.AppField name="description">
							{(field) => (
								<field.TextareaField
									label="Description"
									placeholder="Describe the condition, size, or any special notes..."
									numberOfLines={4}
								/>
							)}
						</form.AppField>
					</View>

					{/* Categories Flow Section */}
					<View className="mb-6">
						<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
							Category
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{CATEGORIES.map((cat) => {
								const isSelected = activeCategory === cat;
								return (
									<Pressable
										key={cat}
										onPress={() => setActiveCategory(cat)}
										className={cn(
											"rounded-full border px-4 py-2 transition-all duration-200",
											isSelected
												? "border-[#316342] bg-[#316342]"
												: "border-transparent bg-[#efeee9]",
										)}
									>
										<Text
											type="body-xs"
											className={cn(
												"font-semibold",
												isSelected ? "text-white" : "text-[#414942]",
											)}
										>
											{cat}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>

					{/* Set Pickup Location Mockup Map */}
					<View className="mb-6">
						<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
							Set Pickup Location
						</Text>
						<Card className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#efeee9] p-0 shadow-sm">
							<Image
								source={{ uri: MAP_MOCK }}
								className="h-full w-full"
								contentFit="cover"
							/>
							{/* Location details card overlay */}
							<View className="absolute right-3 bottom-3 left-3 flex-row items-center justify-between rounded-xl border border-[#efeee9] bg-white/95 p-3">
								<View className="flex-row items-center gap-2">
									<Icon as={MapPin} className="size-5 text-primary" />
									<Text type="body-xs" className="font-semibold text-[#1b1c19]">
										124 Maple Terrace, Austin
									</Text>
								</View>
								<TouchableOpacity>
									<Text type="body-xs" className="font-bold text-primary">
										Change
									</Text>
								</TouchableOpacity>
							</View>
						</Card>
					</View>

					{/* Pickup Toggles using SwitchField */}
					<View className="mb-8 gap-4 rounded-2xl bg-[#f5f4ef] p-4">
						<form.AppField name="curbsidePickup">
							{(field) => (
								<field.SwitchField
									label="Curbside Pickup"
									description="I'll leave it out for anyone"
								/>
							)}
						</form.AppField>

						<View className="my-0.5 border-[#efeee9] border-t" />

						<form.AppField name="porchPickup">
							{(field) => (
								<field.SwitchField
									label="Porch Pickup"
									description="Message me for a time"
								/>
							)}
						</form.AppField>
					</View>

					{/* Post Button */}
					<View className="mb-10">
						<Button
							size="lg"
							className="flex-row items-center justify-center gap-2 rounded-xl bg-[#316342] py-4"
							onPress={form.handleSubmit}
						>
							<Button.Label className="font-bold text-lg text-white">
								Post Item
							</Button.Label>
							<Icon as={Send} className="size-5 text-white" />
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
