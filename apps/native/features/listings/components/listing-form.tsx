import type {
	ListingCategoryType,
	ListingConditionType,
	ListingStatusType,
} from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import {
	Camera,
	Image as ImageIcon,
	MapPin,
	Plus,
	Send,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, TouchableOpacity } from "react-native";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { KeyboardAvoidingView, View } from "@/components/ui/view";
import { cn } from "@/lib/utils";

const MAP_MOCK =
	"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/pickup_map_mock_1780101925282.png";

const FORM_CATEGORIES = [
	"Furniture",
	"Kitchen",
	"Toys",
	"Garden",
	"Books",
	"Electronics",
	"Clothing",
	"Tools",
	"Other",
];

const CATEGORY_MAP: Record<string, ListingCategoryType> = {
	Furniture: "FURNITURE",
	Kitchen: "KITCHEN",
	Toys: "TOYS",
	Garden: "GARDEN",
	Books: "BOOKS",
	Electronics: "ELECTRONICS",
	Clothing: "CLOTHING",
	Tools: "TOOLS",
	Other: "OTHER",
};

// Reverse map to find category label by value
const REVERSE_CATEGORY_MAP: Record<ListingCategoryType, string> = {
	FURNITURE: "Furniture",
	KITCHEN: "Kitchen",
	TOYS: "Toys",
	GARDEN: "Garden",
	BOOKS: "Books",
	ELECTRONICS: "Electronics",
	CLOTHING: "Clothing",
	TOOLS: "Tools",
	OTHER: "Other",
	SPORTS: "Other",
};

const CONDITIONS: ListingConditionType[] = [
	"NEW",
	"LIKE_NEW",
	"GOOD",
	"FAIR",
	"WORN",
];

const CONDITION_LABELS: Record<ListingConditionType, string> = {
	NEW: "New",
	LIKE_NEW: "Like New",
	GOOD: "Good",
	FAIR: "Fair",
	WORN: "Worn",
};

const STATUS_OPTIONS: ListingStatusType[] = [
	"AVAILABLE",
	"PICKED_UP",
	"EXPIRED",
	"REMOVED",
];

const STATUS_LABELS: Record<ListingStatusType, string> = {
	AVAILABLE: "Available",
	PICKED_UP: "Picked Up (Claimed)",
	EXPIRED: "Expired",
	REMOVED: "Removed",
};

const listingFormSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.max(80, "Title must be under 80 characters"),
	description: z.string().max(500, "Description must be under 500 characters"),
});

type ListingFormValues = {
	title: string;
	description: string;
	category: ListingCategoryType;
	condition: ListingConditionType;
	status?: ListingStatusType;
};

type Props = {
	initialValues?: Partial<ListingFormValues>;
	onSubmit: (values: {
		title: string;
		description: string;
		category: ListingCategoryType;
		condition: ListingConditionType;
		status?: ListingStatusType;
	}) => Promise<void>;
	isSubmitting: boolean;
	submitLabel?: string;
	showStatusSelector?: boolean;
};

export function ListingForm({
	initialValues,
	onSubmit,
	isSubmitting,
	submitLabel = "Post Item",
	showStatusSelector = false,
}: Props) {
	const { toast } = useToast();

	// Initialize states
	const [activeCategory, setActiveCategory] = useState<string>(() => {
		if (initialValues?.category) {
			return REVERSE_CATEGORY_MAP[initialValues.category] || "Other";
		}
		return "Furniture";
	});

	const [activeCondition, setActiveCondition] = useState<ListingConditionType>(
		() => initialValues?.condition || "GOOD",
	);

	const [activeStatus, setActiveStatus] = useState<ListingStatusType>(
		() => initialValues?.status || "AVAILABLE",
	);

	const form = useAppForm({
		defaultValues: {
			title: initialValues?.title || "",
			description: initialValues?.description || "",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: listingFormSchema,
		},
		onSubmit: async ({ value }) => {
			const category = CATEGORY_MAP[activeCategory] || "OTHER";
			await onSubmit({
				title: value.title,
				description: value.description,
				category,
				condition: activeCondition,
				...(showStatusSelector ? { status: activeStatus } : {}),
			});
		},
	});

	const handleSimulatePhoto = () => {
		toast.show({
			variant: "success",
			label: "Simulated photo attached!",
		});
	};

	return (
		<KeyboardAvoidingView className="flex-1">
			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{/* Add Photos Section */}
				<View className="mt-4 mb-6">
					<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
						Add Photos
					</Text>
					<View className="flex-row gap-3">
						<TouchableOpacity
							onPress={handleSimulatePhoto}
							className="aspect-square flex-1 items-center justify-center rounded-2xl border border-[#c1c9bf] border-dashed bg-[#efeee9]/30 py-4"
						>
							<Icon as={Camera} className="mb-1 size-6 text-primary" />
							<Text type="body-xs" className="font-bold text-[#414942]">
								Camera
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handleSimulatePhoto}
							className="aspect-square flex-1 items-center justify-center rounded-2xl border border-[#c1c9bf] border-dashed bg-[#efeee9]/30 py-4"
						>
							<Icon as={ImageIcon} className="mb-1 size-6 text-primary" />
							<Text type="body-xs" className="font-bold text-[#414942]">
								Gallery
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handleSimulatePhoto}
							className="aspect-square flex-1 items-center justify-center rounded-2xl bg-[#efeee9]/50 py-4"
						>
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

				{/* Categories Section */}
				<View className="mb-6">
					<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
						Category
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{FORM_CATEGORIES.map((cat) => {
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

				{/* Condition Selector Section */}
				<View className="mb-6">
					<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
						Condition
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{CONDITIONS.map((cond) => {
							const isSelected = activeCondition === cond;
							return (
								<Pressable
									key={cond}
									onPress={() => setActiveCondition(cond)}
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
										{CONDITION_LABELS[cond]}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				{/* Status Selector Section (Conditional) */}
				{showStatusSelector && (
					<View className="mb-6">
						<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
							Item Status
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{STATUS_OPTIONS.map((status) => {
								const isSelected = activeStatus === status;
								return (
									<Pressable
										key={status}
										onPress={() => setActiveStatus(status)}
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
											{STATUS_LABELS[status]}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
				)}

				{/* Pickup Location Card */}
				<View className="mb-6">
					<Text type="body-sm" className="mb-3 font-bold text-[#785832]">
						Set Pickup Location
					</Text>
					<Card className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#efeee9] bg-[#efeee9] p-0 shadow-sm">
						<Image
							source={{ uri: MAP_MOCK }}
							className="h-full w-full opacity-90"
							contentFit="cover"
						/>
						{/* Location details card overlay */}
						<View className="absolute right-3 bottom-3 left-3 flex-row items-center justify-between rounded-xl border border-[#efeee9] bg-white/95 p-3 shadow-sm">
							<View className="flex-row items-center gap-2">
								<Icon as={MapPin} className="size-5 text-primary" />
								<Text type="body-xs" className="font-semibold text-[#1b1c19]">
									124 Maple Terrace, Maplewood
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

				{/* Submit Button */}
				<View className="mb-10">
					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isFormSubmitting) => (
							<Button
								size="lg"
								className="flex-row items-center justify-center gap-2 rounded-xl bg-[#316342] py-4"
								onPress={form.handleSubmit}
								isLoading={isFormSubmitting || isSubmitting}
								loadingText="Saving..."
							>
								<Button.Label className="font-bold text-lg text-white">
									{submitLabel}
								</Button.Label>
								<Icon as={Send} className="size-5 text-white" />
							</Button>
						)}
					</form.Subscribe>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
