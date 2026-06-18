import { useRouter } from "expo-router";
import { Gift, Plus } from "lucide-react-native";
import { FlatList, RefreshControl } from "react-native";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
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
		router.push(`/listings/${id}` as any);
	};

	return (
		<View className="flex-1 bg-background">
			<Header />

			<View className="flex-1 px-4">
				{/* Top Info section */}
				<View className="mb-6 flex-row items-center justify-between rounded-2xl bg-[#f5f4ef] p-4">
					<View className="flex-1 pr-4">
						<Text type="body-sm" className="mb-1 font-bold text-primary">
							My Shared Items
						</Text>
						<Text type="body-xs" className="text-[#7A6A5A]">
							Manage the listings you've posted, mark them as claimed, or remove
							them when gone.
						</Text>
					</View>
					<Button
						variant="primary"
						size="sm"
						className="flex-row items-center gap-1 rounded-full bg-[#316342] px-3 py-2"
						onPress={() => router.push("/dashboard/post")}
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
						<Text type="body-sm" className="mt-4 text-[#7A6A5A]">
							Loading your porch listings...
						</Text>
					</View>
				) : listings.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6 py-20 text-center">
						<View className="mb-4 size-16 items-center justify-center rounded-full bg-[#efeee9]">
							<Icon as={Gift} className="size-8 text-[#A89880]" />
						</View>
						<Text type="h4" className="mb-2 font-bold text-[#1b1c19]">
							Your Porch is Empty
						</Text>
						<Text type="body-sm" className="mb-8 text-center text-[#7A6A5A]">
							Have household items, furniture, or clothes to give away? Set them
							free!
						</Text>
						<Button
							variant="primary"
							className="rounded-xl bg-[#316342] px-6 py-3"
							onPress={() => router.push("/dashboard/post")}
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
								tintColor="#316342"
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
