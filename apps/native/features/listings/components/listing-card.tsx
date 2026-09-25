import type { ListingDto } from "@free-on-the-porch/shared/schemas";
import { ChevronRight, Clock, MapPin, Tag } from "lucide-react-native";
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
	formatDistance,
	formatTimeAgo,
} from "../constants/listings.constants";
import { HighlightedTitle } from "./highlighted-title";

// ─── Variants ─────────────────────────────────────────────────────────────────

// 1. Standard Listing Card
type ListingCardProps = {
	item: ListingDto;
	onPress: (id: string) => void;
	className?: string;
	aspectRatioClassName?: string;
	searchTerm?: string;
};

export function ListingCard({
	item,
	onPress,
	className,
	aspectRatioClassName,
	searchTerm,
}: ListingCardProps) {
	const thumb = item.images[0]?.url;
	const isUnavailable = item.status !== "AVAILABLE";
	const timeAgo = formatTimeAgo(item.createdAt);

	return (
		<Pressable
			onPress={() => onPress(item.id)}
			className={cn("active:opacity-85", className)}
		>
			<View className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-black/5 shadow-sm">
				<View className={cn("aspect-4/3 bg-surface", aspectRatioClassName)}>
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
						<View className="absolute inset-0 items-center justify-center bg-black/50">
							<Text type="body-sm" className="font-bold text-white">
								{item.status === "PICKED_UP" ? "Picked Up" : "Unavailable"}
							</Text>
						</View>
					)}

					<View className="absolute top-2 left-2 rounded-full shadow-black/20 shadow-sm">
						<Badge
							color={resolveColorAlias(item.condition)}
							appearance="solid"
							size="sm"
						>
							<Text className="font-bold text-[10px] uppercase">
								{CONDITION_LABEL[item.condition]}
							</Text>
						</Badge>
					</View>
				</View>

				<View className="gap-1 px-3 pt-2.5 pb-3">
					<HighlightedTitle
						title={item.title}
						searchTerm={searchTerm}
						type="body-sm"
						className="font-bold text-foreground"
						numberOfLines={1}
					/>
					{item.address ? (
						<Text
							type="body-xs"
							className="text-muted-foreground"
							numberOfLines={1}
						>
							{item.address}
						</Text>
					) : null}
					<View className="flex-row items-center justify-between gap-1">
						<Text
							type="body-xs"
							className="shrink font-medium text-muted-foreground"
							numberOfLines={1}
						>
							{CATEGORY_LABEL[item.category]}
						</Text>
						<View className="shrink-0 flex-row items-center gap-1">
							{item.distanceMeters != null && (
								<Text type="body-xs" className="font-semibold text-secondary">
									{formatDistance(item.distanceMeters)}
								</Text>
							)}
							{timeAgo ? (
								<Text type="body-xs" className="text-muted-foreground">
									• {timeAgo}
								</Text>
							) : null}
						</View>
					</View>
				</View>
			</View>
		</Pressable>
	);
}

// 2. Featured Listing Card
type FeaturedCardProps = {
	item: ListingDto;
	onPress: (id: string) => void;
	searchTerm?: string;
};

export function FeaturedCard({ item, onPress, searchTerm }: FeaturedCardProps) {
	const thumb = item.images[0]?.url;
	const timeAgo = formatTimeAgo(item.createdAt);

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
						<View className="h-full w-full items-center justify-center bg-surface">
							<Icon as={Tag} className="size-8 text-muted-foreground" />
						</View>
					)}

					<View className="absolute top-3 left-3 rounded-full shadow-black/20 shadow-sm">
						<Badge
							color={resolveColorAlias(item.condition)}
							appearance="solid"
							size="sm"
						>
							<Text className="font-bold text-[10px] uppercase">
								{CONDITION_LABEL[item.condition]}
							</Text>
						</Badge>
					</View>
				</View>

				<View className="p-4">
					<HighlightedTitle
						title={item.title}
						searchTerm={searchTerm}
						type="h4"
						className="mb-1.5 font-bold text-foreground"
					/>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-1.5">
							{item.distanceMeters != null && (
								<View className="flex-row items-center gap-1">
									<Icon as={MapPin} className="size-3.5 text-secondary" />
									<Text type="body-xs" className="font-semibold text-secondary">
										{formatDistance(item.distanceMeters)}
									</Text>
								</View>
							)}
							{timeAgo ? (
								<View className="flex-row items-center gap-1">
									<Icon as={Clock} className="size-3 text-muted-foreground" />
									<Text
										type="body-xs"
										className="font-medium text-muted-foreground"
									>
										{timeAgo}
									</Text>
								</View>
							) : null}
						</View>
						{item.address ? (
							<Text
								type="body-xs"
								className="font-medium text-muted-foreground"
							>
								{item.address}
							</Text>
						) : null}
					</View>
				</View>
			</View>
		</Pressable>
	);
}

// 3. Compact Recent List Row (for "Recently Posted" section)
type RecentListRowProps = {
	item: ListingDto;
	onPress: (id: string) => void;
	searchTerm?: string;
};

export function RecentListRow({
	item,
	onPress,
	searchTerm,
}: RecentListRowProps) {
	const thumb = item.images[0]?.url;
	const distanceText = formatDistance(item.distanceMeters);
	const timeText = formatTimeAgo(item.createdAt);
	const metaText = [distanceText, timeText, item.address]
		.filter(Boolean)
		.join(" · ");

	return (
		<Pressable
			onPress={() => onPress(item.id)}
			className="rounded-2xl border border-border bg-card p-3 shadow-black/5 shadow-sm active:opacity-80"
		>
			<View className="flex-row items-center">
				{thumb ? (
					<Image
						source={{ uri: thumb }}
						className="size-16 rounded-xl"
						contentFit="cover"
					/>
				) : (
					<View className="size-16 items-center justify-center rounded-xl bg-surface">
						<Icon as={Tag} className="size-6 text-muted-foreground" />
					</View>
				)}

				<View className="mx-3 flex-1 justify-center">
					<HighlightedTitle
						title={item.title}
						searchTerm={searchTerm}
						type="body-sm"
						className="mb-0.5 font-bold text-foreground"
						numberOfLines={1}
					/>
					<Text type="body-xs" className="font-medium text-muted-foreground">
						{metaText}
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
			<Skeleton className="aspect-4/3 w-full" />
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
