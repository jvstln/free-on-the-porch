import {
	type FeedListingsQueryDto,
	FeedListingsQuerySchema,
	LISTING_CATEGORY,
} from "@free-on-the-porch/shared/schemas";
import { useState } from "react";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { View } from "@/components/ui/view";
import { CATEGORY_LABEL } from "../constants/listings.constants";

// ─── Tab Filter ────────────────────────────────────────────────────────────────

export type Tab = "Feed" | "Map";
export const TABS: Tab[] = ["Feed", "Map"];

export interface TabFilterProps {
	value: Tab;
	onValueChange: (tab: Tab) => void;
	className?: string;
}

export function TabFilter({ value, onValueChange, className }: TabFilterProps) {
	return (
		<ToggleGroup
			value={value}
			onValueChange={(val) => onValueChange(val as Tab)}
			type="segmented"
			className={className}
		>
			{TABS.map((tab) => (
				<ToggleGroup.Item key={tab} value={tab}>
					{tab}
				</ToggleGroup.Item>
			))}
		</ToggleGroup>
	);
}

// ─── Category Filter ──────────────────────────────────────────────────────────

export interface CategoryFilterProps {
	value?: FeedListingsQueryDto["category"];
	onValueChange: (category: FeedListingsQueryDto["category"]) => void;
	className?: string;
	contentContainerClassName?: string;
}

export function CategoryFilter({
	value,
	onValueChange,
	className,
	contentContainerClassName,
}: CategoryFilterProps) {
	const handleValueChange = (val: string | number) => {
		onValueChange(
			val === value ? "" : (val as FeedListingsQueryDto["category"]),
		);
	};

	return (
		<ToggleGroup
			value={value ?? ""}
			onValueChange={handleValueChange}
			type="pill"
			scrollable
			className={className}
			contentContainerClassName={contentContainerClassName ?? "px-4 gap-2"}
		>
			{LISTING_CATEGORY.map((cat) => (
				<ToggleGroup.Item key={cat} value={cat}>
					{CATEGORY_LABEL[cat] ?? cat}
				</ToggleGroup.Item>
			))}
		</ToggleGroup>
	);
}

// ─── Sort Filter ──────────────────────────────────────────────────────────────

export interface SortFilterProps {
	value?: FeedListingsQueryDto["sort"];
	onValueChange: (sort: "closest" | "newest") => void;
	className?: string;
}

export function SortFilter({
	value = "closest",
	onValueChange,
	className,
}: SortFilterProps) {
	return (
		<ToggleGroup
			value={value}
			onValueChange={(val) => onValueChange(val as "closest" | "newest")}
			type="pill"
			className={className}
			contentContainerClassName="gap-[6px]"
		>
			<ToggleGroup.Item value="closest">Recommended</ToggleGroup.Item>
			<ToggleGroup.Item value="newest">Newest</ToggleGroup.Item>
		</ToggleGroup>
	);
}

// ─── Radius Filter ────────────────────────────────────────────────────────────

export interface RadiusFilterProps {
	value?: FeedListingsQueryDto["radiusMeters"];
	onValueChange: (radius: "closest" | number) => void;
	className?: string;
}

export function RadiusFilter({
	value = "closest",
	onValueChange,
	className,
}: RadiusFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [tempRadius, setTempRadius] = useState("");

	const isPreset = value === "closest" || value === 5 || value === 15;
	const toggleValue = isPreset ? (value ?? "closest") : "custom";

	return (
		<>
			<ToggleGroup
				value={toggleValue}
				onValueChange={(val) => {
					if (val === "custom") {
						setIsOpen(true);
					} else {
						const parsed =
							FeedListingsQuerySchema.shape.radiusMeters.parse(val);
						onValueChange(parsed);
					}
				}}
				type="pill"
				scrollable
				className={className}
				contentContainerClassName="gap-[6px]"
			>
				<ToggleGroup.Item value="closest">Closest</ToggleGroup.Item>
				<ToggleGroup.Item value={5}>5 km</ToggleGroup.Item>
				<ToggleGroup.Item value={15}>15 km</ToggleGroup.Item>
				<ToggleGroup.Item value="custom">
					{isPreset ? "Custom" : `Custom (${value} km)`}
				</ToggleGroup.Item>
			</ToggleGroup>

			<BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
				<BottomSheetContent>
					<View className="gap-4 px-6 pt-2 pb-8">
						<BottomSheetTitle>Custom Radius</BottomSheetTitle>
						<BottomSheetDescription>
							Enter a custom search radius in kilometers.
						</BottomSheetDescription>
						<View className="flex-row items-center gap-3">
							<Input
								keyboardType="numeric"
								value={tempRadius}
								onChangeText={setTempRadius}
								placeholder="e.g. 50"
								className="flex-1"
							/>
							<Button
								color="primary"
								appearance="solid"
								onPress={() => {
									const val = Number.parseFloat(tempRadius);
									if (!Number.isNaN(val) && val > 0) {
										onValueChange(val);
										setIsOpen(false);
										setTempRadius("");
									}
								}}
							>
								<Button.Label>Apply</Button.Label>
							</Button>
						</View>
					</View>
				</BottomSheetContent>
			</BottomSheet>
		</>
	);
}
