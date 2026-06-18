import { useRouter } from "expo-router";
import { Edit, Gift, LogOut, Settings, Tag } from "lucide-react-native";
import { FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { ListingCard } from "@/features/listings/components/listing-card";
import { useMyListings } from "@/features/listings/hooks/use-listings";
import { MOCK_USER } from "@/features/mock/mock-data";
import { authClient } from "@/lib/auth-client";

export function ProfilePage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { data: session } = authClient.useSession();

	// Load own listings
	const {
		data: listings = [],
		isLoading,
		refetch,
		isRefetching,
	} = useMyListings();

	const user = (session?.user || MOCK_USER) as any;
	const joinedDate = user.createdAt
		? new Date(user.createdAt)
		: new Date(MOCK_USER.createdAt);
	const formattedDate = joinedDate.toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	});

	const sharedCount = listings.length;
	const claimedCount = listings.filter((l) => l.status === "PICKED_UP").length;

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			router.replace("/login");
		} catch (err) {
			console.error("[ProfilePage] Failed to sign out:", err);
			// Fallback redirect
			router.replace("/login");
		}
	};

	const handleListingPress = (id: string) => {
		router.push(`/listings/${id}` as any);
	};

	return (
		<View className="flex-1 bg-background">
			{/* Profile List Container */}
			<FlatList
				data={listings}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperStyle={{ gap: 16 }}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-4"
				style={{ paddingTop: Math.max(insets.top, 12) }}
				contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						tintColor="#316342"
					/>
				}
				ListHeaderComponent={
					<View className="gap-6 pb-6">
						{/* Header row */}
						<View className="flex-row items-center justify-between">
							<Text type="h3" className="font-bold text-primary">
								My Porch
							</Text>
							<Button
								appearance="soft"
								color="neutral"
								className="size-10 items-center justify-center rounded-full p-0"
								onPress={() => router.push("/settings" as any)}
							>
								<Icon as={Settings} className="size-5 text-muted-foreground" />
							</Button>
						</View>

						{/* Profile details card */}
						<Card className="rounded-3xl border border-border bg-card p-5 shadow-sm">
							<View className="flex-row items-center gap-4">
								<Avatar className="size-16 rounded-full bg-muted">
									{user.image ? (
										<Avatar.Image src={user.image} />
									) : (
										<Avatar.Fallback>
											{user.name
												?.split(" ")
												.map((w: string) => w[0])
												.join("")
												.toUpperCase() || "NB"}
										</Avatar.Fallback>
									)}
								</Avatar>
								<View className="flex-1 justify-center">
									<Text type="h4" className="font-bold text-foreground">
										{user.name}
									</Text>
									<Text type="body-xs" className="mt-0.5 text-muted-foreground">
										Joined {formattedDate}
									</Text>
								</View>
							</View>

							{/* Bio text */}
							{user.bio && (
								<Text
									type="body-sm"
									className="mt-4 text-muted-foreground leading-relaxed"
								>
									{user.bio}
								</Text>
							)}

							{/* Actions row */}
							<View className="mt-5 flex-row gap-3">
								<Button
									appearance="soft"
									color="primary"
									size="sm"
									className="flex-1 flex-row items-center gap-1.5 rounded-xl py-2.5"
									onPress={() => router.push("/profile/edit" as any)}
								>
									<Icon as={Edit} className="size-4" />
									<Button.Label className="font-bold text-xs">
										Edit Profile
									</Button.Label>
								</Button>

								<Button
									appearance="outline"
									color="destructive"
									size="sm"
									className="flex-1 flex-row items-center gap-1.5 rounded-xl py-2.5"
									onPress={handleSignOut}
								>
									<Icon as={LogOut} className="size-4" />
									<Button.Label className="font-bold text-xs">
										Sign Out
									</Button.Label>
								</Button>
							</View>
						</Card>

						{/* Stats Row */}
						<View className="flex-row gap-4">
							<Card className="flex-1 items-center rounded-2xl border border-border bg-card p-4 shadow-sm">
								<View className="mb-1 size-10 items-center justify-center rounded-full border border-border/40 bg-[#faf9f4]">
									<Icon as={Tag} className="size-5 text-secondary" />
								</View>
								<Text type="h3" className="font-bold text-foreground">
									{sharedCount}
								</Text>
								<Text
									type="body-xs"
									className="font-semibold text-muted-foreground"
								>
									Items Posted
								</Text>
							</Card>

							<Card className="flex-1 items-center rounded-2xl border border-border bg-card p-4 shadow-sm">
								<View className="mb-1 size-10 items-center justify-center rounded-full border border-border/40 bg-[#faf9f4]">
									<Icon as={Gift} className="size-5 text-primary" />
								</View>
								<Text type="h3" className="font-bold text-foreground">
									{claimedCount}
								</Text>
								<Text
									type="body-xs"
									className="font-semibold text-muted-foreground"
								>
									Items Claimed
								</Text>
							</Card>
						</View>

						{/* Section Title */}
						<View className="mt-2 flex-row items-center justify-between">
							<Text type="h4" className="font-bold text-foreground">
								My Shared Items
							</Text>
							{sharedCount > 0 && (
								<Badge color="primary" appearance="soft" size="sm">
									<Text className="font-bold text-xs">{sharedCount}</Text>
								</Badge>
							)}
						</View>
					</View>
				}
				ListEmptyComponent={
					<View className="items-center justify-center py-12 text-center">
						<View className="mb-3 size-12 items-center justify-center rounded-full bg-muted">
							<Icon as={Tag} className="size-6 text-muted-foreground" />
						</View>
						<Text type="body-sm" className="font-bold text-foreground">
							No items posted yet
						</Text>
						<Text
							type="body-xs"
							className="mt-1 px-6 text-center text-muted-foreground"
						>
							Clear out clutter by posting free household materials or items you
							place on your porch.
						</Text>
					</View>
				}
				renderItem={({ item }) => (
					<ListingCard
						item={item}
						onPress={handleListingPress}
						className="flex-1"
					/>
				)}
			/>
		</View>
	);
}
