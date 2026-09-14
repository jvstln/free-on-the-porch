import {
	type CreateListingDto,
	CreateListingSchema,
	LISTING_CATEGORY,
	LISTING_CONDITION,
	LISTING_STATUS,
} from "@free-on-the-porch/shared/schemas";
import { revalidateLogic } from "@tanstack/react-form";
import { LocateFixed, MapPin, Send } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import {
	ImagePicker,
	type ImagePickerAsset,
} from "@/components/ui/image-picker";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { KeyboardAvoidingView, View } from "@/components/ui/view";
import { useLocation } from "@/hooks/use-location";
import { resolveColorAlias } from "@/lib/colors.util";
import {
	CATEGORY_LABEL,
	CONDITION_LABEL,
	STATUS_LABEL,
} from "../constants/listings.constants";
import { ListingLocationMap } from "./listing-location-map";

type PhotoAsset = {
	uri: string;
	file?: File;
};

type Props = {
	initialValues?: Partial<CreateListingDto>;
	initialPhotos?: PhotoAsset[];
	onSubmit: (
		values: CreateListingDto & { photos: PhotoAsset[] },
	) => Promise<void>;
	isSubmitting: boolean;
	submitLabel?: string;
	showStatusSelector?: boolean;
};

const CATEGORY_OPTIONS = LISTING_CATEGORY.map((cat) => ({
	value: cat,
	label: CATEGORY_LABEL[cat] ?? cat,
}));

const CONDITION_OPTIONS = LISTING_CONDITION.map((cond) => ({
	value: cond,
	label: CONDITION_LABEL[cond] ?? cond,
	color: resolveColorAlias(cond),
}));

const STATUS_OPTIONS = LISTING_STATUS.filter((s) => s !== "RESERVED").map(
	(status) => ({
		value: status,
		label: STATUS_LABEL[status] ?? status,
	}),
);

const MAX_PHOTOS = 5;

export function ListingForm({
	initialValues,
	initialPhotos,
	onSubmit,
	isSubmitting,
	submitLabel = "Post Item",
	showStatusSelector = false,
}: Props) {
	const [photos, setPhotos] = useState<ImagePickerAsset[]>(initialPhotos ?? []);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const {
		coords,
		address: currentAddress,
		getCurrentLocation,
		isLoading: isLocating,
		error: locationError,
	} = useLocation();

	const handlePhotosChange = (newPhotos: ImagePickerAsset[]) => {
		setPhotos(newPhotos);
		if (newPhotos.length > 0) {
			setPhotoError(null);
		}
	};

	const handleGetLocation = async () => {
		const result = await getCurrentLocation(true);
		if (result) {
			form.setFieldValue("location", result.location);
			form.setFieldValue("address", result.address);
			toast.success(`Location set: ${result.address}`);
		} else {
			toast.error(
				locationError ??
					"Could not capture GPS location. Please check device permissions.",
			);
		}
	};

	const handleSubmitPress = () => {
		if (photos.length === 0) {
			setPhotoError("At least one photo is required to post an item.");
			toast.error("Please add at least one photo of the item.");
		}
		form.handleSubmit();
	};

	const form = useAppForm({
		defaultValues: {
			title: initialValues?.title ?? "",
			description: initialValues?.description ?? "",
			category: initialValues?.category ?? "FURNITURE",
			condition: initialValues?.condition ?? "GOOD",
			address: initialValues?.address ?? currentAddress ?? "",
			location: initialValues?.location ?? coords ?? undefined,
			status: initialValues?.status ?? "AVAILABLE",
		} as CreateListingDto,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: CreateListingSchema,
		},
		onSubmit: async ({ value }) => {
			if (photos.length === 0) {
				setPhotoError("At least one photo is required to post an item.");
				toast.error("Please add at least one photo of the item.");
				return;
			}

			let loc = value.location;
			let addr = value.address;

			if (!loc) {
				const res = await getCurrentLocation(false);
				if (res) {
					loc = res.location;
					addr = addr || res.address;
				} else {
					toast.error(
						"Please enable location access to post an item on the porch.",
					);
					return;
				}
			}

			await onSubmit({
				title: value.title,
				description: value.description || undefined,
				category: value.category,
				condition: value.condition,
				address: addr || undefined,
				location: loc,
				...(showStatusSelector ? { status: value.status } : {}),
				photos,
			});
		},
	});

	// Automatically detect and set current user location if not editing an existing listing
	useEffect(() => {
		if (initialValues?.location) return;

		if (coords) {
			form.setFieldValue("location", coords);
			if (currentAddress && !form.getFieldValue("address")) {
				form.setFieldValue("address", currentAddress);
			}
		} else {
			getCurrentLocation(false).then((result) => {
				if (result) {
					form.setFieldValue("location", result.location);
					if (!form.getFieldValue("address")) {
						form.setFieldValue("address", result.address);
					}
				}
			});
		}
	}, [
		coords,
		currentAddress,
		getCurrentLocation,
		form,
		initialValues?.location,
	]);

	return (
		<KeyboardAvoidingView className="flex-1">
			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{/* Photos Section */}
				<View className="mt-4 mb-6">
					<View className="mb-3 flex-row items-center gap-1">
						<Text type="body-sm" className="font-bold text-secondary">
							Add Photos
						</Text>
						<Text type="body-sm" className="font-bold text-destructive">
							*
						</Text>
						<Text type="body-xs" className="text-muted-foreground">
							({photos.length}/{MAX_PHOTOS})
						</Text>
					</View>
					<ImagePicker
						value={photos}
						onChange={handlePhotosChange}
						max={MAX_PHOTOS}
						title="Add photos of the item"
						description={`Snap it on your porch or choose an existing photo (up to ${MAX_PHOTOS})`}
					/>
					{photoError && (
						<Text type="body-xs" className="mt-2 font-medium text-destructive">
							{photoError}
						</Text>
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

					<form.AppField name="description">
						{(field) => (
							<field.TextareaField
								label="Description"
								placeholder="Describe the condition, size, or any special notes..."
								numberOfLines={4}
							/>
						)}
					</form.AppField>

					<form.AppField name="category">
						{(field) => (
							<field.ToggleGroupField
								label="Category"
								options={CATEGORY_OPTIONS}
							/>
						)}
					</form.AppField>

					<form.AppField name="condition">
						{(field) => (
							<field.ToggleGroupField
								label="Condition"
								options={CONDITION_OPTIONS}
							/>
						)}
					</form.AppField>

					{showStatusSelector && (
						<form.AppField name="status">
							{(field) => (
								<field.ToggleGroupField
									label="Item Status"
									options={STATUS_OPTIONS}
								/>
							)}
						</form.AppField>
					)}
				</View>

				{/* Pickup Location Section */}
				<View className="mb-6 gap-3">
					<View className="gap-1">
						<Text type="body-sm" className="font-bold text-secondary">
							Pickup Location
						</Text>
						<Text type="body-xs" className="text-muted-foreground">
							Approximate area shown to neighbors. Specific address is shared
							only when a pickup is confirmed.
						</Text>
					</View>

					<form.Subscribe
						selector={(state) => ({
							location: state.values.location,
							address: state.values.address,
						})}
					>
						{({ location, address }) => (
							<View className="gap-3">
								<ListingLocationMap
									location={location ?? coords ?? null}
									address={
										address ||
										currentAddress ||
										(isLocating ? "Locating current area…" : null)
									}
								/>

								<Button
									appearance="outline"
									color="default"
									size="sm"
									className="w-full"
									onPress={handleGetLocation}
									isLoading={isLocating}
									loadingText="Detecting GPS..."
								>
									<Icon as={LocateFixed} className="size-4 text-primary" />
									<Button.Label className="font-medium text-xs">
										{location
											? "Refresh GPS Location"
											: "Detect Current GPS Location"}
									</Button.Label>
								</Button>

								<form.AppField name="address">
									{(field) => (
										<field.InputField
											label="Neighborhood / Area Name"
											placeholder="e.g. Near Main Street, Front porch"
										/>
									)}
								</form.AppField>

								{location && (
									<View className="flex-row items-center justify-between px-1">
										<View className="flex-row items-center gap-1.5">
											<Icon
												as={MapPin}
												className="size-3.5 text-muted-foreground"
											/>
											<Text type="body-xs" className="text-muted-foreground">
												GPS: {location.lat.toFixed(4)},{" "}
												{location.lng.toFixed(4)}
											</Text>
										</View>
										<Text type="body-xs" className="text-muted-foreground">
											200m privacy circle
										</Text>
									</View>
								)}
							</View>
						)}
					</form.Subscribe>
				</View>

				{/* Submit Button */}
				<View className="mb-10">
					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isFormSubmitting) => (
							<Button
								size="lg"
								color="primary"
								className="w-full"
								onPress={handleSubmitPress}
								isLoading={isFormSubmitting || isSubmitting}
								loadingText="Saving..."
							>
								{submitLabel}
								<Icon as={Send} className="size-4" />
							</Button>
						)}
					</form.Subscribe>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
