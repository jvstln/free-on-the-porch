import type {
	ListingCategoryType,
	ListingConditionType,
	ListingStatusType,
} from "@free-on-the-porch/shared/schemas";
import { ChevronRight, MapPin, Tag } from "lucide-react-native";
import { Pressable } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { resolveColorAlias } from "@/lib/colors.util";
import { cn } from "@/lib/utils";
import {
	CATEGORY_LABEL,
	CONDITION_LABEL,
	DEFAULT_LOCATION,
	formatDistance,
} from "../constants/listings.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListingCardItem = {
	id: string;
	title: string;
	category: ListingCategoryType;
	condition: ListingConditionType;
	status: ListingStatusType;
	address?: string | null;
	distanceMeters?: number | null;
	images: { url: string }[];
	user: { name: string; image?: string | null };
	createdAt: string;
	userId?: string;
};

// ─── Variants ─────────────────────────────────────────────────────────────────

// 1. Standard Listing Card
type ListingCardProps = {
	item: ListingCardItem;
	onPress: (id: string) => void;
	className?: string;
	aspectRatioClassName?: string;
};

export function ListingCard({
	item,
	onPress,
	className,
	aspectRatioClassName,
}: ListingCardProps) {
	const thumb = item.images[0]?.url;
	const isUnavailable = item.status !== "AVAILABLE";

	return (
		<Pressable
			onPress={() => onPress(item.id)}
			className={cn("active:opacity-80", className)}
		>
			<View className="overflow-hidden rounded-2xl bg-card shadow-black/10 shadow-sm">
				<View className={cn("aspect-[4/3] bg-muted", aspectRatioClassName)}>
					{thumb ? (
						<Image
							source={{ uri: thumb }}
							className="h-full w-full"
							contentFit="cover"
						/>
					) : (
						<View className="flex-1 items-center justify-center gap-2">
							<Icon as={Tag} className="size-8 text-muted-foreground" />
							<Text type="body-sm" className="text-muted-foreground">
								No photo
							</Text>
						</View>
					)}

					{isUnavailable && (
						<View className="absolute inset-0 items-center justify-center bg-black/40">
							<Text type="body-sm" className="font-semibold text-white">
								{item.status === "PICKED_UP" ? "Picked up" : "Unavailable"}
							</Text>
						</View>
					)}

					<View className="absolute top-2 left-2">
						<Badge
							color={resolveColorAlias(item.condition)}
							appearance="solid"
							size="sm"
						>
							<Text>{CONDITION_LABEL[item.condition]}</Text>
						</Badge>
					</View>
				</View>

				<View className="gap-1 px-3 pt-2.5 pb-3">
					<Text
						type="body-sm"
						className="font-semibold text-foreground"
						numberOfLines={1}
					>
						{item.title}
					</Text>
					<View className="flex-row items-center justify-between">
						<Text type="body-xs" className="text-muted-foreground">
							{CATEGORY_LABEL[item.category]}
						</Text>
						{item.distanceMeters != null && (
							<View className="flex-row items-center gap-1">
								<Icon as={MapPin} className="size-3 text-secondary" />
								<Text type="body-xs" className="text-secondary">
									{formatDistance(item.distanceMeters)}
								</Text>
							</View>
						)}
					</View>
				</View>
			</View>
		</Pressable>
	);
}

// 2. Featured Listing Card
type FeaturedCardProps = {
	item: ListingCardItem;
	onPress: (id: string) => void;
};

export function FeaturedCard({ item, onPress }: FeaturedCardProps) {
	const thumb = item.images[0]?.url;

	return (
		<Pressable
			onPress={() => onPress(item.id)}
			className="mb-4 active:opacity-95"
		>
			<View className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
				<View className="relative h-56 w-full">
					{thumb ? (
						<Image
							source={{ uri: thumb }}
							className="h-full w-full"
							contentFit="cover"
						/>
					) : (
						<View className="h-full w-full items-center justify-center bg-muted">
							<Icon as={Tag} className="size-8 text-muted-foreground" />
						</View>
					)}

					<View className="absolute top-3 left-3">
						<Badge
							color={resolveColorAlias(item.condition)}
							appearance="solid"
							size="sm"
						>
							<Text>{CONDITION_LABEL[item.condition]}</Text>
						</Badge>
					</View>
				</View>

				<View className="p-4">
					<Text type="h4" className="mb-1.5 font-bold text-foreground">
						{item.title}
					</Text>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-1">
							<Icon as={MapPin} className="size-3.5 text-secondary" />
							<Text type="body-xs" className="font-semibold text-secondary">
								{formatDistance(item.distanceMeters)}
							</Text>
						</View>
						<Text type="body-xs" className="font-medium text-muted-foreground">
							{item.address ?? DEFAULT_LOCATION}
						</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}

// 3. Recent Listing List Row
type RecentListRowProps = {
	item: ListingCardItem;
	onPress: (id: string) => void;
};

export function RecentListRow({ item, onPress }: RecentListRowProps) {
	const thumb = item.images[0]?.url;
	const distanceText = formatDistance(item.distanceMeters);

	return (
		<Pressable onPress={() => onPress(item.id)} className="active:opacity-90">
			<View className="flex-row items-center rounded-2xl border border-border bg-card p-3">
				{thumb ? (
					<Image
						source={{ uri: thumb }}
						className="size-16 rounded-xl bg-muted"
						contentFit="cover"
					/>
				) : (
					<View className="size-16 items-center justify-center rounded-xl bg-muted">
						<Icon as={Tag} className="size-8 text-muted-foreground" />
					</View>
				)}

				<View className="mx-3 flex-1 justify-center">
					<Text
						type="body-sm"
						className="mb-0.5 font-bold text-foreground"
						numberOfLines={1}
					>
						{item.title}
					</Text>
					<Text type="body-xs" className="font-medium text-muted-foreground">
						{[distanceText, item.address ?? DEFAULT_LOCATION]
							.filter(Boolean)
							.join(" · ")}
					</Text>
				</View>

				<Icon as={ChevronRight} className="size-5 text-muted-foreground" />
			</View>
		</Pressable>
	);
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

// 1. Standard Listing Card Skeleton
export function ListingCardSkeleton({ className }: { className?: string }) {
	return (
		<View
			className={cn(
				"overflow-hidden rounded-2xl bg-card shadow-black/10 shadow-sm",
				className,
			)}
		>
			<Skeleton className="aspect-[4/3] w-full" />
			<View className="gap-2 px-3 pt-2.5 pb-3">
				<Skeleton className="h-4 w-3/4" />
				<View className="flex-row items-center justify-between">
					<Skeleton className="h-3 w-1/4" />
					<Skeleton className="h-3 w-1/5" />
				</View>
			</View>
		</View>
	);
}

// 2. Featured Card Skeleton
export function FeaturedCardSkeleton() {
	return (
		<View className="mb-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
			<Skeleton className="h-56 w-full" />
			<View className="gap-2.5 p-4">
				<Skeleton className="h-5 w-2/3" />
				<View className="flex-row items-center justify-between">
					<Skeleton className="h-3.5 w-1/5" />
					<Skeleton className="h-3.5 w-1/4" />
				</View>
			</View>
		</View>
	);
}

// 3. Recent List Row Skeleton
export function RecentListRowSkeleton() {
	return (
		<View className="flex-row items-center rounded-2xl border border-border bg-card p-3">
			<Skeleton className="size-16 rounded-xl" />
			<View className="mx-3 flex-1 justify-center gap-2">
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-3 w-1/3" />
			</View>
		</View>
	);
}
