import type {
	FeedListingsQueryDto,
	ListingDto,
} from "@free-on-the-porch/shared/schemas";
import { useRouter } from "expo-router";
import { Compass, Tag } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Keyboard,
	Platform,
	Pressable,
	RefreshControl,
	type View as RNView,
	type TextInput,
} from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { SearchInput } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { QueryState } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "@/components/ui/view";
import { UserMenu } from "@/features/users/components/user-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { resolveColorAlias } from "@/lib/colors.util";
import { cn } from "@/lib/utils";
import {
	CONDITION_LABEL,
	DEFAULT_COORDS,
	DEFAULT_LOCATION,
	formatDistance,
} from "../constants/listings.constants";
import { useFeedListings } from "../hooks/use-listings";
import {
	FeaturedCard,
	FeaturedCardSkeleton,
	ListingCard,
	RecentListRow,
	RecentListRowSkeleton,
} from "./listing-card";
import {
	CategoryFilter,
	RadiusFilter,
	SortFilter,
	TABS,
	type Tab,
	TabFilter,
} from "./listing-filters";
import { MapView, NativeMap, WebMapFallback } from "./listings-map";

// ─── Skeleton Loading State Page ──────────────────────────────────────────────

function LoadingState() {
	return (
		<View className="gap-4">
			{/* Featured card loading skeleton */}
			<FeaturedCardSkeleton />

			{/* Bento grid loading skeleton */}
			<View className="gap-4">
				<View className="flex-row gap-4">
					<Skeleton className="aspect-3/4 flex-1" />
					<View className="flex-1 gap-4">
						<Skeleton className="aspect-16/10" />
						<Skeleton className="aspect-16/10" />
					</View>
				</View>
				<View className="flex-row gap-4">
					<View className="flex-1 gap-4">
						<Skeleton className="aspect-16/10" />
						<Skeleton className="aspect-16/10" />
					</View>
					<Skeleton className="aspect-3/4 flex-1" />
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

// ─── Bento Grid Card Layout ───────────────────────────────────────────────────

function BentoGrid({
	items,
	onPress,
	searchTerm,
}: {
	items: ListingDto[];
	onPress: (id: string) => void;
	searchTerm?: string;
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
						searchTerm={searchTerm}
					/>
				)}
				<View className="flex-1 gap-4">
					{items[1] && (
						<ListingCard
							item={items[1]}
							onPress={onPress}
							aspectRatioClassName="aspect-[16/10]"
							searchTerm={searchTerm}
						/>
					)}
					{items[2] && (
						<ListingCard
							item={items[2]}
							onPress={onPress}
							aspectRatioClassName="aspect-[16/10]"
							searchTerm={searchTerm}
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
								searchTerm={searchTerm}
							/>
						)}
						{items[4] && (
							<ListingCard
								item={items[4]}
								onPress={onPress}
								aspectRatioClassName="aspect-[16/10]"
								searchTerm={searchTerm}
							/>
						)}
					</View>
					{items[5] && (
						<ListingCard
							item={items[5]}
							onPress={onPress}
							className="flex-1"
							aspectRatioClassName="aspect-[3/4]"
							searchTerm={searchTerm}
						/>
					)}
				</View>
			)}
		</View>
	);
}

type RecentSectionProps = {
	items: ListingDto[];
	onPress: (id: string) => void;
	searchTerm?: string;
	title?: string;
};

function RecentSection({
	items,
	onPress,
	searchTerm,
	title = "Recently Posted Nearby",
}: RecentSectionProps) {
	if (items.length === 0) return null;

	return (
		<View className="mb-8">
			<Text type="h4" className="mb-3 font-bold text-foreground">
				{title}
			</Text>
			<View className="gap-2.5">
				{items.map((item) => (
					<RecentListRow
						key={item.id}
						item={item}
						onPress={onPress}
						searchTerm={searchTerm}
					/>
				))}
			</View>
		</View>
	);
}

// ─── Main Listings Page ───────────────────────────────────────────────────────

export const ListingsPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("Feed");
	const [filters, setFilters] = useState<
		Pick<FeedListingsQueryDto, "category" | "radiusMeters" | "sort">
	>({ category: "", radiusMeters: "closest", sort: "closest" });
	const [selectedListing, setSelectedListing] = useState<ListingDto | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 350);
	const hasSearch = debouncedSearch.trim().length > 0;

	const inputRef = useRef<TextInput>(null);
	const searchContainerRef = useRef<RNView>(null);
	const isSearchFocusedRef = useRef(false);

	const dismissSearch = useCallback(() => {
		inputRef.current?.blur();
		Keyboard.dismiss();
		if (Platform.OS === "web" && typeof document !== "undefined") {
			(document.activeElement as HTMLElement | null)?.blur?.();
		}
	}, []);

	// On Web, clicking outside the search container or scrolling should blur the active search input
	useEffect(() => {
		if (Platform.OS !== "web" || typeof document === "undefined") return;

		const handlePointerDown = (event: MouseEvent | PointerEvent) => {
			const target = event.target as HTMLElement | null;
			if (
				(
					searchContainerRef.current as unknown as HTMLElement | null
				)?.contains?.(target) ||
				target?.closest?.("#search-input-container")
			) {
				return;
			}
			dismissSearch();
		};

		const handleScroll = (event: Event) => {
			const target = event.target as HTMLElement | null;
			if (target?.closest?.("#search-input-container")) {
				return;
			}
			dismissSearch();
		};

		document.addEventListener("pointerdown", handlePointerDown, true);
		window.addEventListener("scroll", handleScroll, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [dismissSearch]);

	// Query feed listings with cursor-based infinite scroll
	const feedListingsQuery = useFeedListings({
		lat: DEFAULT_COORDS.lat,
		lng: DEFAULT_COORDS.lng,
		...filters,
		query: debouncedSearch,
	});

	const {
		data,
		isRefetching,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = feedListingsQuery;

	const listings = data?.listings ?? [];

	const handleListingPress = (id: string) => {
		dismissSearch();
		router.push(`/dashboard/listings/${id}`);
	};

	const [featuredItem, ...rest] = listings;
	const bentoItems = rest.slice(0, 6);
	const recentItems = rest.slice(6);

	return (
		<View className="flex-1 bg-background">
			<PageHeader>
				<SearchInput
					containerRef={searchContainerRef}
					inputRef={inputRef}
					className="grow"
					value={searchQuery}
					onChange={setSearchQuery}
					onFocus={() => {
						isSearchFocusedRef.current = true;
					}}
					onBlur={() => {
						isSearchFocusedRef.current = false;
					}}
					onSubmitEditing={dismissSearch}
					placeholder="Search the porch…"
				/>
				<View onTouchStart={dismissSearch}>
					<UserMenu />
				</View>
			</PageHeader>

			<View
				className="flex-1"
				onTouchStart={() => {
					if (isSearchFocusedRef.current) {
						dismissSearch();
					}
				}}
			>
				{activeTab === "Feed" ? (
					<ScrollView
						className="flex-1 px-4"
						contentContainerClassName="pt-3 pb-8"
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="on-drag"
						onScrollBeginDrag={dismissSearch}
						refreshControl={
							<RefreshControl refreshing={isRefetching} onRefresh={refetch} />
						}
					>
						<View className="mb-4 flex-row items-center justify-between">
							<View className="flex-row items-center gap-1.5">
								<Icon as={Compass} className="size-4 text-muted-foreground" />
								<Text
									type="body-sm"
									className="font-medium text-muted-foreground"
								>
									Nearby:{" "}
									<Text type="body-sm" className="font-bold text-primary">
										{DEFAULT_LOCATION}
									</Text>
								</Text>
							</View>

							<TabFilter
								value={activeTab}
								onValueChange={(tab) => {
									dismissSearch();
									setActiveTab(tab);
								}}
							/>
						</View>

						<CategoryFilter
							value={filters.category}
							onValueChange={(category) => {
								dismissSearch();
								setFilters((f) => ({
									...f,
									category,
								}));
							}}
							className="-mx-4 mb-4"
						/>

						<View className="mb-4 flex-row items-center gap-2">
							<Text
								type="body-xs"
								className="font-bold text-muted-foreground uppercase tracking-wider"
							>
								Sort:
							</Text>
							<SortFilter
								value={filters.sort}
								onValueChange={(sort) => {
									dismissSearch();
									setFilters((f) => ({
										...f,
										sort,
									}));
								}}
							/>
						</View>

						<View className="mb-4 flex-row items-center gap-2">
							<Text
								type="body-xs"
								className="font-bold text-muted-foreground uppercase tracking-wider"
							>
								Radius:
							</Text>
							<RadiusFilter
								value={filters.radiusMeters}
								onValueChange={(radius) => {
									dismissSearch();
									setFilters((f) => ({
										...f,
										radiusMeters: radius,
									}));
								}}
							/>
						</View>

						<QueryState
							query={feedListingsQuery}
							getIsLoading={(q) => (q.isLoading ? <LoadingState /> : false)}
							getIsEmpty={(q) => {
								return q.data?.listings?.length === 0
									? {
											title: hasSearch
												? `No matches for "${debouncedSearch.trim()}"`
												: "Nothing on the porch nearby",
											description: hasSearch
												? "Try a different search term or widen your search radius."
												: "Be the first to post a free item in this category or expand your search radius!",
											cta: (
												<Button
													onPress={() => {
														dismissSearch();
														setSearchQuery("");
														setFilters({
															category: "",
															radiusMeters: "closest",
															sort: "closest",
														});
													}}
													appearance="soft"
													color="primary"
												>
													Clear Filters
												</Button>
											),
										}
									: false;
							}}
						>
							{featuredItem && (
								<FeaturedCard
									item={featuredItem}
									onPress={handleListingPress}
									searchTerm={debouncedSearch}
								/>
							)}
							{bentoItems.length > 0 && (
								<BentoGrid
									items={bentoItems}
									onPress={handleListingPress}
									searchTerm={debouncedSearch}
								/>
							)}
							<RecentSection
								items={recentItems}
								onPress={handleListingPress}
								searchTerm={debouncedSearch}
								title={hasSearch ? "More matches" : "Recently Posted Nearby"}
							/>
							{hasNextPage && (
								<Button
									color="neutral"
									appearance="soft"
									size="sm"
									className="mb-4 self-center"
									onPress={() => {
										dismissSearch();
										fetchNextPage();
									}}
									disabled={isFetchingNextPage}
								>
									<Button.Label>
										{isFetchingNextPage ? "Loading…" : "Load more"}
									</Button.Label>
								</Button>
							)}
						</QueryState>
					</ScrollView>
				) : (
					<View className="relative flex-1">
						{Platform.OS === "web" || !MapView ? (
							<WebMapFallback
								listings={listings}
								onSelectPin={(listing) => {
									dismissSearch();
									setSelectedListing(listing);
								}}
								centerCoords={DEFAULT_COORDS}
							/>
						) : (
							<NativeMap
								listings={listings}
								onSelectPin={(listing) => {
									dismissSearch();
									setSelectedListing(listing);
								}}
								centerCoords={DEFAULT_COORDS}
							/>
						)}

						{/* Overlaid category chips at the top */}
						<View className="absolute top-4 right-0 left-0">
							<CategoryFilter
								value={filters.category}
								onValueChange={(category) => {
									dismissSearch();
									setFilters((f) => ({
										...f,
										category,
									}));
								}}
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
											onPress={() => {
												dismissSearch();
												setActiveTab(tab);
											}}
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
										onPress={() => {
											dismissSearch();
											setSelectedListing(null);
										}}
									>
										Close
									</Button>
									<Button
										color="primary"
										appearance="solid"
										size="sm"
										className="flex-1 py-2"
										onPress={() => {
											dismissSearch();
											handleListingPress(selectedListing.id);
										}}
									>
										View Details
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
