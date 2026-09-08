import { useRouter } from "expo-router";
import { Gift, Plus } from "lucide-react-native";
import { FlatList } from "react-native";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { RefreshControl } from "@/components/ui/flat-list";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useMyListings } from "../hooks/use-listings";
import { ListingCard } from "./listing-card";

export function MyListingsPage() {
	const router = useRouter();
	const {
		data: listings = [],
		isLoading,
		refetch,
		isRefetching,
	} = useMyListings();

	const handleListingPress = (id: string) => {
		router.push({ pathname: "/dashboard/listings/[id]", params: { id } });
	};

	return (
		<View className="flex-1 bg-background">
			<Header />

			<View className="flex-1 px-4">
				{/* Top Info section */}
				<View className="mb-6 flex-row items-center justify-between rounded-2xl bg-popover p-4">
					<View className="flex-1 pr-4">
						<Text type="body-sm" className="mb-1 font-bold text-primary">
							My Shared Items
						</Text>
						<Text type="body-xs" className="text-muted-foreground">
							Manage the listings you've posted, mark them as claimed, or remove
							them when gone.
						</Text>
					</View>
					<Button
						variant="primary"
						size="sm"
						className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-2"
						onPress={() => router.push("/dashboard/listings/new")}
					>
						<Icon as={Plus} className="size-4 text-white" />
						<Button.Label className="font-bold text-white text-xs">
							New
						</Button.Label>
					</Button>
				</View>

				{isLoading ? (
					<View className="flex-1 items-center justify-center py-20">
						<Spinner className="size-8 text-primary" />
						<Text type="body-sm" className="mt-4 text-muted-foreground">
							Loading your porch listings...
						</Text>
					</View>
				) : listings.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6 py-20 text-center">
						<View className="mb-4 size-16 items-center justify-center rounded-full bg-muted">
							<Icon as={Gift} className="size-8 text-muted-foreground" />
						</View>
						<Text type="h4" className="mb-2 font-bold text-foreground">
							Your Porch is Empty
						</Text>
						<Text
							type="body-sm"
							className="mb-8 text-center text-muted-foreground"
						>
							Have household items, furniture, or clothes to give away? Set them
							free!
						</Text>
						<Button
							variant="primary"
							className="rounded-xl bg-primary px-6 py-3"
							onPress={() => router.push("/dashboard/listings/new")}
						>
							<Button.Label className="font-bold text-white">
								Post your first item
							</Button.Label>
						</Button>
					</View>
				) : (
					<FlatList
						data={listings}
						keyExtractor={(item) => item.id}
						showsVerticalScrollIndicator={false}
						numColumns={2}
						columnWrapperStyle={{ gap: 16 }}
						contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
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
