import type {
	ListingCategoryDto,
	ListingConditionDto,
	ListingStatusDto,
} from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import * as ImagePicker from "expo-image-picker";
import {
	Camera,
	Image as ImageIcon,
	MapPin,
	Plus,
	Send,
	Trash2,
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
import { toast } from "@/components/ui/toast";
import { KeyboardAvoidingView, View } from "@/components/ui/view";
import { resolveColorAlias } from "@/lib/colors.util";
import { cn } from "@/lib/utils";
import {
	CATEGORY_LABEL,
	CONDITION_LABEL,
} from "../constants/listings.constants";

// Form categories (exclude SPORTS which isn't in the create form)
const FORM_CATEGORIES = Object.entries(CATEGORY_LABEL)
	.filter(([key]) => key !== "SPORTS")
	.map(([, label]) => label);

// Map display label to DTO value
const CATEGORY_MAP: Record<string, ListingCategoryDto> = Object.fromEntries(
	Object.entries(CATEGORY_LABEL)
		.filter(([key]) => key !== "SPORTS")
		.map(([value, label]) => [label, value as ListingCategoryDto]),
);

// Reverse map: DTO value → display label
const REVERSE_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
	Object.entries(CATEGORY_LABEL).map(([value, label]) => [value, label]),
);

const CONDITIONS: ListingConditionDto[] = [
	"NEW",
	"LIKE_NEW",
	"GOOD",
	"FAIR",
	"WORN",
];

const STATUS_OPTIONS: ListingStatusDto[] = [
	"AVAILABLE",
	"PICKED_UP",
	"EXPIRED",
	"REMOVED",
];

const STATUS_LABELS: Record<ListingStatusDto, string> = {
	AVAILABLE: "Available",
	RESERVED: "Reserved",
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
	category: ListingCategoryDto;
	condition: ListingConditionDto;
	status?: ListingStatusDto;
};

type PhotoAsset = {
	uri: string;
	file?: File;
};

type Props = {
	initialValues?: Partial<ListingFormValues>;
	onSubmit: (values: {
		title: string;
		description: string;
		category: ListingCategoryDto;
		condition: ListingConditionDto;
		status?: ListingStatusDto;
		photos: PhotoAsset[];
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
	// Initialize states
	const [activeCategory, setActiveCategory] = useState<string>(() => {
		if (initialValues?.category) {
			return REVERSE_CATEGORY_MAP[initialValues.category] || "Other";
		}
		return "Furniture";
	});

	const [activeCondition, setActiveCondition] = useState<ListingConditionDto>(
		() => initialValues?.condition || "GOOD",
	);

	const [activeStatus, setActiveStatus] = useState<ListingStatusDto>(
		() => initialValues?.status || "AVAILABLE",
	);

	const [photos, setPhotos] = useState<PhotoAsset[]>([]);

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
				photos,
			});
		},
	});

	const MAX_PHOTOS = 5;

	const pickImage = async (fromCamera: boolean) => {
		const permissionMethod = fromCamera
			? ImagePicker.requestCameraPermissionsAsync
			: ImagePicker.requestMediaLibraryPermissionsAsync;

		const { status } = await permissionMethod();
		if (status !== "granted") {
			toast.error(
				fromCamera
					? "Camera permission is required"
					: "Photo library permission is required",
			);
			return;
		}

		const launchMethod = fromCamera
			? ImagePicker.launchCameraAsync
			: ImagePicker.launchImageLibraryAsync;

		const result = await launchMethod({
			mediaTypes: ["images"],
			allowsMultipleSelection: true,
			selectionLimit: MAX_PHOTOS - photos.length,
			quality: 0.8,
		});

		if (!result.canceled && result.assets.length > 0) {
			const newPhotos = result.assets.map((asset) => ({ uri: asset.uri }));
			setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
		}
	};

	const removePhoto = (index: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== index));
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
					<Text type="body-sm" className="mb-3 font-bold text-secondary">
						Add Photos ({photos.length}/{MAX_PHOTOS})
					</Text>

					{photos.length > 0 && (
						<View className="mb-3 flex-row flex-wrap gap-2">
							{photos.map((photo, index) => (
								<View key={photo.uri} className="relative size-20">
									<Image
										source={{ uri: photo.uri }}
										className="size-20 rounded-xl"
										contentFit="cover"
									/>
									<Pressable
										onPress={() => removePhoto(index)}
										className="absolute -top-1.5 -right-1.5 size-6 items-center justify-center rounded-full bg-destructive"
									>
										<Icon
											as={Trash2}
											className="size-3 text-destructive-foreground"
										/>
									</Pressable>
								</View>
							))}
						</View>
					)}

					{photos.length < MAX_PHOTOS && (
						<View className="flex-row gap-3">
							<TouchableOpacity
								onPress={() => pickImage(true)}
								className="aspect-square flex-1 items-center justify-center rounded-2xl border border-border border-dashed bg-muted/30 py-4"
							>
								<Icon as={Camera} className="mb-1 size-6 text-primary" />
								<Text
									type="body-xs"
									className="font-bold text-muted-foreground"
								>
									Camera
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => pickImage(false)}
								className="aspect-square flex-1 items-center justify-center rounded-2xl border border-border border-dashed bg-muted/30 py-4"
							>
								<Icon as={ImageIcon} className="mb-1 size-6 text-primary" />
								<Text
									type="body-xs"
									className="font-bold text-muted-foreground"
								>
									Gallery
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => pickImage(false)}
								className="aspect-square flex-1 items-center justify-center rounded-2xl bg-muted/50 py-4"
							>
								<Icon as={Plus} className="size-8 text-border" />
							</TouchableOpacity>
						</View>
					)}
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
					<Text type="body-sm" className="mb-3 font-bold text-secondary">
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
											? "border-primary bg-primary"
											: "border-transparent bg-muted",
									)}
								>
									<Text
										type="body-xs"
										className={cn(
											"font-semibold",
											isSelected ? "text-white" : "text-muted-foreground",
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
					<Text type="body-sm" className="mb-3 font-bold text-secondary">
						Condition
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{CONDITIONS.map((cond) => {
							const isSelected = activeCondition === cond;
							const colorKey = resolveColorAlias(cond);
							const colorClasses: Record<string, string> = {
								primary: "border-primary bg-primary",
								warning: "border-warning bg-warning",
								destructive: "border-destructive bg-destructive",
								success: "border-success bg-success",
								default: "border-primary bg-primary",
							};
							const textColorClasses: Record<string, string> = {
								primary: "text-primary-foreground",
								warning: "text-warning-foreground",
								destructive: "text-destructive-foreground",
								success: "text-success-foreground",
								default: "text-primary-foreground",
							};
							return (
								<Pressable
									key={cond}
									onPress={() => setActiveCondition(cond)}
									className={cn(
										"rounded-full border px-4 py-2 transition-all duration-200",
										isSelected
											? colorClasses[colorKey]
											: "border-transparent bg-muted",
									)}
								>
									<Text
										type="body-xs"
										className={cn(
											"font-semibold",
											isSelected
												? textColorClasses[colorKey]
												: "text-muted-foreground",
										)}
									>
										{CONDITION_LABEL[cond]}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				{/* Status Selector Section (Conditional) */}
				{showStatusSelector && (
					<View className="mb-6">
						<Text type="body-sm" className="mb-3 font-bold text-secondary">
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
												? "border-primary bg-primary"
												: "border-transparent bg-muted",
										)}
									>
										<Text
											type="body-xs"
											className={cn(
												"font-semibold",
												isSelected ? "text-white" : "text-muted-foreground",
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
					<Text type="body-sm" className="mb-3 font-bold text-secondary">
						Set Pickup Location
					</Text>
					<Card className="relative h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-muted bg-muted p-0 shadow-sm">
						<View className="items-center gap-2">
							<Icon as={MapPin} className="size-8 text-muted-foreground" />
							<Text type="body-xs" className="text-muted-foreground">
								Location picker coming soon
							</Text>
						</View>
					</Card>
				</View>

				{/* Submit Button */}
				<View className="mb-10">
					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isFormSubmitting) => (
							<Button
								size="lg"
								className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4"
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
