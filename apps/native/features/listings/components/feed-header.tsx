import {
	type FeedListingsQueryDto,
	FeedListingsQuerySchema,
	LISTING_CATEGORY,
} from "@free-on-the-porch/shared/schemas";
import {
	Compass,
	List,
	Map as MapIcon,
	MapPin,
	SlidersHorizontal,
	X,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { View } from "@/components/ui/view";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON, CATEGORY_LABEL } from "../constants/listings.constants";

export interface FeedHeaderProps {
	// Category
	category?: FeedListingsQueryDto["category"];
	onCategoryChange: (category: FeedListingsQueryDto["category"]) => void;

	// Sort & Radius
	sort?: "closest" | "newest";
	onSortChange: (sort: "closest" | "newest") => void;
	radiusMeters?: "closest" | number;
	onRadiusChange: (radius: "closest" | number) => void;

	// View Mode
	activeTab: "Feed" | "Map";
	onTabChange: (tab: "Feed" | "Map") => void;

	// Geolocation
	address?: string | null;
	isLocating?: boolean;
	isPermissionDenied?: boolean;
	onRefreshLocation: () => void;
}

export function FeedHeader({
	category,
	onCategoryChange,
	sort = "closest",
	onSortChange,
	radiusMeters = "closest",
	onRadiusChange,
	activeTab,
	onTabChange,
	address,
	isLocating,
	isPermissionDenied,
	onRefreshLocation,
}: FeedHeaderProps) {
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
	const [tempRadius, setTempRadius] = useState("");
	const [isCustomRadiusOpen, setIsCustomRadiusOpen] = useState(false);

	const hasActiveFilters = sort !== "closest" || radiusMeters !== "closest";
	const isPresetRadius =
		radiusMeters === "closest" || radiusMeters === 5 || radiusMeters === 15;
	const radiusToggleValue = isPresetRadius
		? (radiusMeters ?? "closest")
		: "custom";

	const getRadiusLabel = () => {
		if (radiusMeters === "closest") return "Closest";
		return `${radiusMeters} km`;
	};

	return (
		<View className="gap-2.5 pb-2">
			{/* Category horizontal scroll with rich icons */}
			<ToggleGroup
				value={category ?? ""}
				onValueChange={(val) => {
					onCategoryChange(
						val === category ? "" : (val as FeedListingsQueryDto["category"]),
					);
				}}
				type="pill"
				size="sm"
				scrollable
				className="-mx-4"
				contentContainerClassName="px-4 gap-1.5"
			>
				<ToggleGroup.Item
					value=""
					className="flex-row items-center gap-1.5 px-3"
				>
					<Icon as={CATEGORY_ICON.ALL} className="size-3.5" />
					All
				</ToggleGroup.Item>
				{LISTING_CATEGORY.map((cat) => {
					const CatIcon = CATEGORY_ICON[cat];
					return (
						<ToggleGroup.Item
							key={cat}
							value={cat}
							className="flex-row items-center gap-1.5 px-3"
						>
							{CatIcon && <Icon as={CatIcon} className="size-3.5" />}
							{CATEGORY_LABEL[cat] ?? cat}
						</ToggleGroup.Item>
					);
				})}
			</ToggleGroup>

			{/* Compact control row: Location on left, Filter & View toggles on right */}
			<View className="flex-row items-center justify-between gap-2">
				{/* Location Pill (compact, self-sized, clean truncation) */}
				<View className="flex-1 shrink">
					{isLocating && !address ? (
						<View className="h-7 flex-row items-center gap-1.5 self-start rounded-full border border-border bg-card px-2.5">
							<Icon
								as={Compass}
								className="size-3 shrink-0 text-muted-foreground"
							/>
							<Text
								type="body-xs"
								className="font-medium text-muted-foreground"
							>
								Locating…
							</Text>
						</View>
					) : address ? (
						<Pressable
							onPress={onRefreshLocation}
							className="h-7 flex-row items-center gap-1.5 self-start rounded-full border border-border bg-card px-2.5 active:bg-surface/50"
						>
							<Icon as={MapPin} className="size-3 shrink-0 text-primary" />
							<Text
								type="body-xs"
								className="shrink font-medium text-foreground"
								numberOfLines={1}
							>
								{address}
							</Text>
						</Pressable>
					) : isPermissionDenied ? (
						<Pressable
							onPress={onRefreshLocation}
							className="h-7 flex-row items-center gap-1.5 self-start rounded-full border border-destructive/20 bg-destructive/10 px-2.5 active:opacity-70"
						>
							<Icon as={MapPin} className="size-3 shrink-0 text-destructive" />
							<Text
								type="body-xs"
								className="shrink font-medium text-destructive"
								numberOfLines={1}
							>
								Location off • Retry
							</Text>
						</Pressable>
					) : (
						<Pressable
							onPress={onRefreshLocation}
							className="h-7 flex-row items-center gap-1.5 self-start rounded-full border border-border bg-card px-2.5 active:bg-surface/50"
						>
							<Icon
								as={Compass}
								className="size-3 shrink-0 text-muted-foreground"
							/>
							<Text
								type="body-xs"
								className="font-medium text-muted-foreground"
							>
								Nearby
							</Text>
						</Pressable>
					)}
				</View>

				{/* Right Actions: Filters & Map Toggle */}
				<View className="shrink-0 flex-row items-center gap-1.5">
					{/* Filter / Sort Button */}
					<Button
						appearance={hasActiveFilters ? "solid" : "outline"}
						color={hasActiveFilters ? "primary" : "default"}
						size="xs"
						className="h-7 rounded-full px-2.5"
						onPress={() => setIsFilterSheetOpen(true)}
					>
						<Icon
							as={SlidersHorizontal}
							className={cn(
								"size-3",
								hasActiveFilters
									? "text-primary-foreground"
									: "text-muted-foreground",
							)}
						/>
						{sort === "newest"
							? "Newest"
							: radiusMeters !== "closest"
								? getRadiusLabel()
								: "Filters"}
						{hasActiveFilters && (
							<View className="size-1.5 rounded-full bg-primary-foreground" />
						)}
					</Button>

					{/* View Mode Toggle Button */}
					<Button
						appearance="outline"
						color="default"
						size="xs"
						className="size-7 rounded-full p-0"
						onPress={() => onTabChange(activeTab === "Feed" ? "Map" : "Feed")}
						accessibilityLabel={
							activeTab === "Feed"
								? "Switch to Map view"
								: "Switch to Feed view"
						}
					>
						<Icon
							as={activeTab === "Feed" ? MapIcon : List}
							className="size-3 text-muted-foreground"
						/>
					</Button>
				</View>
			</View>

			{/* Active Filter Chips Bar */}
			{(hasActiveFilters || !!category) && (
				<View className="flex-row flex-wrap items-center gap-1.5 pt-0.5">
					{category && (
						<Pressable
							onPress={() => onCategoryChange("")}
							className="h-6 flex-row items-center gap-1 rounded-full border border-border bg-card px-2 active:bg-surface"
						>
							<Text type="body-xs" className="font-semibold text-foreground">
								{CATEGORY_LABEL[category]}
							</Text>
							<Icon as={X} className="size-3 text-muted-foreground" />
						</Pressable>
					)}
					{sort !== "closest" && (
						<Pressable
							onPress={() => onSortChange("closest")}
							className="h-6 flex-row items-center gap-1 rounded-full border border-border bg-card px-2 active:bg-surface"
						>
							<Text type="body-xs" className="font-semibold text-foreground">
								Newest
							</Text>
							<Icon as={X} className="size-3 text-muted-foreground" />
						</Pressable>
					)}
					{radiusMeters !== "closest" && (
						<Pressable
							onPress={() => onRadiusChange("closest")}
							className="h-6 flex-row items-center gap-1 rounded-full border border-border bg-card px-2 active:bg-surface"
						>
							<Text type="body-xs" className="font-semibold text-foreground">
								Within {radiusMeters}km
							</Text>
							<Icon as={X} className="size-3 text-muted-foreground" />
						</Pressable>
					)}
					<Pressable
						onPress={() => {
							onCategoryChange("");
							onSortChange("closest");
							onRadiusChange("closest");
						}}
						className="ml-auto"
					>
						<Text type="body-xs" className="font-medium text-primary">
							Reset all
						</Text>
					</Pressable>
				</View>
			)}

			{/* Filters Bottom Sheet */}
			<BottomSheet
				isOpen={isFilterSheetOpen}
				onOpenChange={setIsFilterSheetOpen}
			>
				<BottomSheetContent>
					<View className="gap-5 pt-1 pb-6">
						{/* Header row */}
						<View className="flex-row items-center justify-between">
							<BottomSheetTitle>Filter & Sort</BottomSheetTitle>
							{hasActiveFilters && (
								<Button
									appearance="ghost"
									color="primary"
									size="xs"
									onPress={() => {
										onSortChange("closest");
										onRadiusChange("closest");
									}}
								>
									Reset All
								</Button>
							)}
						</View>
						<BottomSheetDescription className="-mt-3 text-muted-foreground">
							Customize discovery radius and listing sort order
						</BottomSheetDescription>

						{/* Sort Option */}
						<View className="gap-2">
							<Text
								type="body-xs"
								className="font-bold text-muted-foreground uppercase tracking-wider"
							>
								Sort By
							</Text>
							<ToggleGroup
								value={sort}
								onValueChange={(val) =>
									onSortChange(val as "closest" | "newest")
								}
								type="segmented"
								size="sm"
								className="w-full"
							>
								<ToggleGroup.Item value="closest" className="flex-1">
									Recommended
								</ToggleGroup.Item>
								<ToggleGroup.Item value="newest" className="flex-1">
									Newest
								</ToggleGroup.Item>
							</ToggleGroup>
						</View>

						{/* Radius Option */}
						<View className="gap-2">
							<Text
								type="body-xs"
								className="font-bold text-muted-foreground uppercase tracking-wider"
							>
								Distance Radius
							</Text>
							<ToggleGroup
								value={radiusToggleValue}
								onValueChange={(val) => {
									if (val === "custom") {
										setIsCustomRadiusOpen(true);
									} else {
										const parsed =
											FeedListingsQuerySchema.shape.radiusMeters.parse(val);
										onRadiusChange(parsed);
										setIsCustomRadiusOpen(false);
									}
								}}
								type="pill"
								size="sm"
								className="flex-row gap-2"
							>
								<ToggleGroup.Item value="closest">Closest</ToggleGroup.Item>
								<ToggleGroup.Item value={5}>5 km</ToggleGroup.Item>
								<ToggleGroup.Item value={15}>15 km</ToggleGroup.Item>
								<ToggleGroup.Item value="custom">
									{isPresetRadius ? "Custom" : `Custom (${radiusMeters} km)`}
								</ToggleGroup.Item>
							</ToggleGroup>

							{/* Custom radius input if opened or active */}
							{(isCustomRadiusOpen || !isPresetRadius) && (
								<View className="mt-2 flex-row items-center gap-2">
									<Input
										keyboardType="numeric"
										value={tempRadius}
										onChangeText={setTempRadius}
										placeholder="e.g. 25"
										className="h-10 flex-1"
									/>
									<Button
										color="primary"
										size="sm"
										onPress={() => {
											const val = Number.parseFloat(tempRadius);
											if (!Number.isNaN(val) && val > 0) {
												onRadiusChange(val);
												setIsCustomRadiusOpen(false);
												setTempRadius("");
											}
										}}
									>
										Set km
									</Button>
								</View>
							)}
						</View>

						{/* Apply Button */}
						<Button
							color="primary"
							className="mt-2 w-full"
							onPress={() => setIsFilterSheetOpen(false)}
						>
							Apply Filters
						</Button>
					</View>
				</BottomSheetContent>
			</BottomSheet>
		</View>
	);
}
