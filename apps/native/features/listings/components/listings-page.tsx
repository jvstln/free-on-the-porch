import { useRouter } from "expo-router";
import { Compass, Tag } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, RefreshControl } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { SearchInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "@/components/ui/view";
import { UserMenu } from "@/features/users/components/user-menu";
import { resolveColorAlias } from "@/lib/colors.util";
import { cn } from "@/lib/utils";
import {
	CATEGORIES,
	CATEGORY_MAP,
	CONDITION_LABEL,
	DEFAULT_COORDS,
	DEFAULT_LOCATION,
	formatDistance,
} from "../constants/listings.constants";
import { useNearbyListings } from "../hooks/use-listings";
import {
	FeaturedCard,
	FeaturedCardSkeleton,
	ListingCard,
	type ListingCardItem,
	RecentListRow,
	RecentListRowSkeleton,
} from "./listing-card";
import { MapView, NativeMap, WebMapFallback } from "./listings-map";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "Feed" | "Map";
const TABS: Tab[] = ["Feed", "Map"];

const RADIUS_OPTIONS = [1, 5, 15, 25];

// ─── Location Banner ──────────────────────────────────────────────────────────

type LocationBannerProps = {
	location: string;
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
};

function LocationBanner({
	location,
	activeTab,
	onTabChange,
}: LocationBannerProps) {
	return (
		<View className="mb-4 flex-row items-center justify-between">
			<View className="flex-row items-center gap-1.5">
				<Icon as={Compass} className="size-4 text-muted-foreground" />
				<Text type="body-sm" className="font-medium text-muted-foreground">
					Nearby:{" "}
					<Text type="body-sm" className="font-bold text-primary">
						{location}
					</Text>
				</Text>
			</View>

			<View className="flex-row rounded-full bg-[#efeee9] p-0.5">
				{TABS.map((tab) => {
					const isActive = activeTab === tab;
					return (
						<Pressable
							key={tab}
							onPress={() => onTabChange(tab)}
							className={cn(
								"rounded-full px-4 py-1.5",
								isActive ? "bg-primary" : "bg-transparent",
							)}
						>
							<Text
								type="body-xs"
								className={cn(
									"font-bold",
									isActive
										? "text-primary-foreground"
										: "text-muted-foreground",
								)}
							>
								{tab}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

// ─── Category Pills ───────────────────────────────────────────────────────────

type CategoryPillsProps = {
	categories: readonly string[];
	activeCategory: string;
	onCategoryChange: (category: string) => void;
	className?: string;
};

function CategoryPills({
	categories,
	activeCategory,
	onCategoryChange,
	className,
}: CategoryPillsProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className={cn("-mx-4 mb-4 flex-row", className)}
			contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
		>
			{categories.map((category) => {
				const isActive = activeCategory === category;
				return (
					<Button
						key={category}
						onPress={() => onCategoryChange(category)}
						color={isActive ? "primary" : "neutral"}
						appearance={"soft"}
						className="rounded-full"
						size="sm"
					>
						{category}
					</Button>
				);
			})}
		</ScrollView>
	);
}

// ─── Radius Selector ──────────────────────────────────────────────────────────

function RadiusSelector({
	selected,
	onSelect,
}: {
	selected: number;
	onSelect: (radius: number) => void;
}) {
	return (
		<View className="mb-4 flex-row items-center gap-2">
			<Text
				type="body-xs"
				className="font-bold text-muted-foreground uppercase tracking-wider"
			>
				Radius:
			</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 6 }}
			>
				{RADIUS_OPTIONS.map((rad) => {
					const isActive = selected === rad;
					return (
						<Pressable
							key={rad}
							onPress={() => onSelect(rad)}
							className={cn(
								"rounded-full border px-3 py-1 transition-all duration-200",
								isActive
									? "border-primary bg-primary"
									: "border-border bg-card",
							)}
						>
							<Text
								type="body-xs"
								className={cn(
									"font-bold",
									isActive
										? "text-primary-foreground"
										: "text-muted-foreground",
								)}
							>
								{rad} km
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}

// ─── Skeleton Loading State Page ──────────────────────────────────────────────

function LoadingState() {
	return (
		<View className="gap-4">
			{/* Featured card loading skeleton */}
			<FeaturedCardSkeleton />

			{/* Bento grid loading skeleton */}
			<View className="gap-4">
				<View className="flex-row gap-4">
					<Skeleton className="aspect-[3/4] flex-1" />
					<View className="flex-1 gap-4">
						<Skeleton className="aspect-[16/10]" />
						<Skeleton className="aspect-[16/10]" />
					</View>
				</View>
				<View className="flex-row gap-4">
					<View className="flex-1 gap-4">
						<Skeleton className="aspect-[16/10]" />
						<Skeleton className="aspect-[16/10]" />
					</View>
					<Skeleton className="aspect-[3/4] flex-1" />
				</View>
			</View>

			{/* Recent section loading skeleton */}
			<View className="mt-4 gap-3">
				<RecentListRowSkeleton />
				<RecentListRowSkeleton />
				<RecentListRowSkeleton />
			</View>
		</View>
	);
}

function EmptyState() {
	return (
		<View className="flex-1 items-center justify-center px-6 py-20">
			<Icon as={Tag} className="mb-3 size-12 text-muted-foreground" />
			<Text type="h4" className="mb-2 font-bold text-foreground">
				Nothing on the porch nearby
			</Text>
			<Text type="body-sm" className="text-center text-muted-foreground">
				Be the first to post a free item in this category or expand your search
				radius!
			</Text>
		</View>
	);
}

// ─── Bento Grid Card Layout ───────────────────────────────────────────────────

function BentoGrid({
	items,
	onPress,
}: {
	items: ListingCardItem[];
	onPress: (id: string) => void;
}) {
	return (
		<View className="mb-4 gap-4">
			{/* Bento Row 1 */}
			<View className="flex-row gap-4">
				{items[0] && (
					<ListingCard
						item={items[0]}
						onPress={onPress}
						className="flex-1"
						aspectRatioClassName="aspect-[3/4]"
					/>
				)}
				<View className="flex-1 gap-4">
					{items[1] && (
						<ListingCard
							item={items[1]}
							onPress={onPress}
							aspectRatioClassName="aspect-[16/10]"
						/>
					)}
					{items[2] && (
						<ListingCard
							item={items[2]}
							onPress={onPress}
							aspectRatioClassName="aspect-[16/10]"
						/>
					)}
				</View>
			</View>

			{/* Bento Row 2 (Reversed Layout) */}
			{items.length > 3 && (
				<View className="flex-row gap-4">
					<View className="flex-1 gap-4">
						{items[3] && (
							<ListingCard
								item={items[3]}
								onPress={onPress}
								aspectRatioClassName="aspect-[16/10]"
							/>
						)}
						{items[4] && (
							<ListingCard
								item={items[4]}
								onPress={onPress}
								aspectRatioClassName="aspect-[16/10]"
							/>
						)}
					</View>
					{items[5] && (
						<ListingCard
							item={items[5]}
							onPress={onPress}
							className="flex-1"
							aspectRatioClassName="aspect-[3/4]"
						/>
					)}
				</View>
			)}
		</View>
	);
}

type RecentSectionProps = {
	items: ListingCardItem[];
	onPress: (id: string) => void;
};

function RecentSection({ items, onPress }: RecentSectionProps) {
	if (items.length === 0) return null;

	return (
		<View className="mb-8">
			<Text type="h4" className="mb-3 font-bold text-foreground">
				Recently Posted Nearby
			</Text>
			<View className="gap-2.5">
				{items.map((item) => (
					<RecentListRow key={item.id} item={item} onPress={onPress} />
				))}
			</View>
		</View>
	);
}

// ─── Main Listings Page ───────────────────────────────────────────────────────

export const ListingsPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("Feed");
	const [activeCategory, setActiveCategory] = useState<string>("All Items");
	const [radiusKm, setRadiusKm] = useState<number>(15);
	const [selectedListing, setSelectedListing] =
		useState<ListingCardItem | null>(null);

	const mappedCategory = CATEGORY_MAP[activeCategory];

	// Query nearby listings
	const {
		data: apiListings = [],
		isLoading,
		isRefetching,
		refetch,
	} = useNearbyListings({
		lat: DEFAULT_COORDS.lat,
		lng: DEFAULT_COORDS.lng,
		radiusKm,
		category: mappedCategory,
		limit: 30,
	});

	const listings = apiListings;

	const handleListingPress = (id: string) => {
		router.push(`/listings/${id}` as any);
	};

	const [featuredItem, ...rest] = listings;
	const bentoItems = rest.slice(0, 6);
	const recentItems = rest.slice(6);

	return (
		<View className="flex-1 bg-background">
			{/* Listings header */}
			<View className="flex-row items-center gap-2 border-border border-b bg-card px-3 py-2">
				<SearchInput className="grow" />
				<UserMenu />
			</View>

			<View className="flex-1">
				{activeTab === "Feed" ? (
					<ScrollView
						className="flex-1 px-4"
						showsVerticalScrollIndicator={false}
						contentContainerClassName="pt-3 pb-8"
						refreshControl={
							<RefreshControl refreshing={isRefetching} onRefresh={refetch} />
						}
					>
						<LocationBanner
							location={DEFAULT_LOCATION}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>

						<CategoryPills
							categories={CATEGORIES}
							activeCategory={activeCategory}
							onCategoryChange={setActiveCategory}
						/>

						<RadiusSelector selected={radiusKm} onSelect={setRadiusKm} />

						{isLoading ? (
							<LoadingState />
						) : listings.length === 0 ? (
							<EmptyState />
						) : (
							<>
								{featuredItem && (
									<FeaturedCard
										item={featuredItem}
										onPress={handleListingPress}
									/>
								)}

								{bentoItems.length > 0 && (
									<BentoGrid items={bentoItems} onPress={handleListingPress} />
								)}

								<RecentSection
									items={recentItems}
									onPress={handleListingPress}
								/>
							</>
						)}
					</ScrollView>
				) : (
					<View className="relative flex-1">
						{Platform.OS === "web" || !MapView ? (
							<WebMapFallback
								listings={listings}
								onSelectPin={setSelectedListing}
								centerCoords={DEFAULT_COORDS}
							/>
						) : (
							<NativeMap
								listings={listings}
								onSelectPin={setSelectedListing}
								centerCoords={DEFAULT_COORDS}
							/>
						)}

						{/* Overlaid category chips at the top */}
						<View className="absolute top-4 right-0 left-0">
							<CategoryPills
								categories={CATEGORIES}
								activeCategory={activeCategory}
								onCategoryChange={setActiveCategory}
							/>
						</View>

						{/* Floating tab selector overlaid */}
						<View className="absolute bottom-4 left-4">
							<View className="flex-row rounded-full border border-border bg-card p-1 shadow-md">
								{TABS.map((tab) => {
									const isActive = activeTab === tab;
									return (
										<Pressable
											key={tab}
											onPress={() => setActiveTab(tab)}
											className={cn(
												"rounded-full px-4 py-1.5",
												isActive ? "bg-primary" : "bg-transparent",
											)}
										>
											<Text
												type="body-xs"
												className={cn(
													"font-bold",
													isActive
														? "text-primary-foreground"
														: "text-muted-foreground",
												)}
											>
												{tab}
											</Text>
										</Pressable>
									);
								})}
							</View>
						</View>

						{/* Bottom mini-card overlay */}
						{selectedListing && (
							<View className="absolute right-4 bottom-4 left-4 rounded-3xl border border-border bg-card p-4 shadow-black/15 shadow-lg">
								<View className="flex-row items-center gap-3">
									{selectedListing.images[0]?.url ? (
										<Image
											source={{ uri: selectedListing.images[0].url }}
											className="size-16 rounded-xl bg-muted"
											contentFit="cover"
										/>
									) : (
										<View className="size-16 items-center justify-center rounded-xl bg-muted">
											<Icon as={Tag} className="size-6 text-muted-foreground" />
										</View>
									)}
									<View className="flex-1">
										<Text
											type="body-sm"
											className="font-bold text-foreground"
											numberOfLines={1}
										>
											{selectedListing.title}
										</Text>
										<Text type="body-xs" className="text-muted-foreground">
											{selectedListing.address ?? DEFAULT_LOCATION}
										</Text>
										<View className="mt-1 flex-row items-center gap-2">
											<Badge
												color={resolveColorAlias(selectedListing.condition)}
												size="sm"
												appearance="solid"
											>
												<Text className="font-bold text-[10px] uppercase">
													{CONDITION_LABEL[selectedListing.condition]}
												</Text>
											</Badge>
											{selectedListing.distanceMeters != null && (
												<Text
													type="body-xs"
													className="font-semibold text-secondary"
												>
													{formatDistance(selectedListing.distanceMeters)}
												</Text>
											)}
										</View>
									</View>
								</View>
								<View className="mt-3 flex-row gap-2">
									<Button
										color="neutral"
										appearance="soft"
										size="sm"
										className="flex-1 py-2"
										onPress={() => setSelectedListing(null)}
									>
										<Button.Label>Close</Button.Label>
									</Button>
									<Button
										color="primary"
										appearance="solid"
										size="sm"
										className="flex-1 py-2"
										onPress={() => handleListingPress(selectedListing.id)}
									>
										<Button.Label>View Details</Button.Label>
									</Button>
								</View>
							</View>
						)}
					</View>
				)}
			</View>
		</View>
	);
};
