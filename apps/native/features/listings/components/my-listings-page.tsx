import { useRouter } from "expo-router";
import { ArrowLeft, Gift, Plus, Tag } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshControl } from "@/components/ui/flat-list";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { View } from "@/components/ui/view";
import { useMyListings } from "../hooks/use-listings";
import { ListingCard } from "./listing-card";

type FilterStatus = "ALL" | "AVAILABLE" | "PICKED_UP";

export function MyListingsPage() {
	const router = useRouter();
	const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

	const {
		data: listings = [],
		isLoading,
		refetch,
		isRefetching,
	} = useMyListings();

	const handleListingPress = (id: string) => {
		router.push({ pathname: "/dashboard/listings/[id]", params: { id } });
	};

	const filteredListings = useMemo(() => {
		if (statusFilter === "ALL") return listings;
		return listings.filter((item) => item.status === statusFilter);
	}, [listings, statusFilter]);

	const availableCount = useMemo(
		() => listings.filter((l) => l.status === "AVAILABLE").length,
		[listings],
	);
	const claimedCount = useMemo(
		() => listings.filter((l) => l.status === "PICKED_UP").length,
		[listings],
	);

	return (
		<View className="flex-1 bg-background">
			{/* Top Page Header */}
			<PageHeader>
				<Pressable
					onPress={() => router.back()}
					className="mr-1 size-9 items-center justify-center rounded-full active:bg-surface"
					accessibilityLabel="Go back"
				>
					<Icon as={ArrowLeft} className="size-5 text-foreground" />
				</Pressable>
				<View className="flex-1 flex-row items-center gap-2">
					<PageHeader.Title>My Listings</PageHeader.Title>
					{listings.length > 0 && (
						<Badge appearance="soft" color="primary" size="sm">
							<Text className="font-bold text-xs">{listings.length}</Text>
						</Badge>
					)}
				</View>
				<Button
					appearance="solid"
					color="primary"
					size="sm"
					className="h-8 gap-1 rounded-full px-3"
					onPress={() => router.push("/dashboard/listings/new")}
				>
					<Icon as={Plus} className="size-3.5 text-primary-foreground" />
					<Button.Label className="font-bold text-xs">Post</Button.Label>
				</Button>
			</PageHeader>

			<View className="flex-1 px-4 pt-3">
				{/* Status Filter Tabs */}
				<View className="mb-4">
					<ToggleGroup
						value={statusFilter}
						onValueChange={(val) => setStatusFilter(val as FilterStatus)}
						type="segmented"
						size="sm"
						className="w-full"
					>
						<ToggleGroup.Item value="ALL" className="flex-1">
							All ({listings.length})
						</ToggleGroup.Item>
						<ToggleGroup.Item value="AVAILABLE" className="flex-1">
							Available ({availableCount})
						</ToggleGroup.Item>
						<ToggleGroup.Item value="PICKED_UP" className="flex-1">
							Claimed ({claimedCount})
						</ToggleGroup.Item>
					</ToggleGroup>
				</View>

				{isLoading ? (
					<View className="flex-1 items-center justify-center py-20">
						<Spinner className="size-8 text-primary" />
						<Text type="body-sm" className="mt-4 text-muted-foreground">
							Loading your porch items...
						</Text>
					</View>
				) : filteredListings.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6 py-20 text-center">
						<View className="mb-4 size-16 items-center justify-center rounded-full bg-surface">
							<Icon
								as={statusFilter === "PICKED_UP" ? Gift : Tag}
								className="size-8 text-muted-foreground"
							/>
						</View>
						<Text type="h4" className="mb-1.5 font-bold text-foreground">
							{statusFilter === "PICKED_UP"
								? "No Claimed Items"
								: statusFilter === "AVAILABLE"
									? "No Active Listings"
									: "Your Porch is Empty"}
						</Text>
						<Text
							type="body-sm"
							className="mb-6 text-center text-muted-foreground"
						>
							{statusFilter === "PICKED_UP"
								? "Items that neighbors have picked up will appear here."
								: "Have unwanted household items or furniture? Set them free for your neighbors!"}
						</Text>
						{statusFilter !== "PICKED_UP" && (
							<Button
								appearance="solid"
								color="primary"
								className="rounded-xl px-6 py-2.5"
								onPress={() => router.push("/dashboard/listings/new")}
							>
								Post a Free Item
							</Button>
						)}
					</View>
				) : (
					<FlatList
						data={filteredListings}
						keyExtractor={(item) => item.id}
						showsVerticalScrollIndicator={false}
						numColumns={2}
						columnWrapperStyle={{ gap: 14 }}
						contentContainerStyle={{ gap: 14, paddingBottom: 40 }}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
								className="text-primary"
							/>
						}
						renderItem={({ item }) => (
							<ListingCard
								item={item}
								onPress={handleListingPress}
								className="flex-1"
							/>
						)}
					/>
				)}
			</View>
		</View>
	);
}
