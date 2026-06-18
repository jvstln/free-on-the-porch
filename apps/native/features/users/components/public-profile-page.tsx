import { useRouter } from "expo-router";
import {
	ArrowLeft,
	MessageSquare,
	MoreVertical,
	Tag,
} from "lucide-react-native";
import { Alert, FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { ListingCard } from "@/features/listings/components/listing-card";
import { useNearbyListings } from "@/features/listings/hooks/use-listings";
import {
	INITIAL_MESSAGES,
	INITIAL_THREADS,
	THREADS_DETAILS,
} from "@/features/mock/mock-data";
import { useUserProfile } from "../hooks/use-user";

type Props = {
	id: string;
};

export function PublicProfilePage({ id }: Props) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useToast();

	// Fetch user details
	const { data: user, isLoading: isUserLoading, error } = useUserProfile(id);

	// Fetch all nearby listings to filter this user's listings
	const {
		data: allListings = [],
		isLoading: isListingsLoading,
		refetch,
		isRefetching,
	} = useNearbyListings({
		lat: 40.7312,
		lng: -74.2738, // default map coordinates
		radiusKm: 50,
		limit: 100,
	});

	if (isUserLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner className="size-8 text-primary" />
				<Text type="body-sm" className="mt-4 text-muted-foreground">
					Loading profile...
				</Text>
			</View>
		);
	}

	if (error || !user) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Text type="h4" className="mb-2 font-bold text-foreground">
					Profile Not Found
				</Text>
				<Text type="body-sm" className="mb-6 text-center text-muted-foreground">
					Unable to retrieve user details at this time.
				</Text>
				<Button onPress={() => router.back()} variant="primary">
					<Button.Label>Go Back</Button.Label>
				</Button>
			</View>
		);
	}

	// Filter neighbor listings to show only AVAILABLE status ones
	const neighborListings = allListings.filter(
		(l) =>
			(l.userId === id || l.user?.name === user.name) &&
			l.status === "AVAILABLE",
	);

	const handleListingPress = (listingId: string) => {
		router.push(`/listings/${listingId}` as any);
	};

	// Start or continue messaging flow
	const handleMessageUser = () => {
		// Look for an existing thread with this neighbor
		const existingThread = INITIAL_THREADS.find(
			(t) =>
				t.otherUser.id === id ||
				t.otherUser.name.toLowerCase() === user.name.toLowerCase(),
		);

		if (existingThread) {
			router.push(`/messages/${existingThread.id}` as any);
		} else {
			// Generate new thread dynamically
			const newThreadId = `thread-${Date.now()}`;
			const firstListing = neighborListings[0];
			const initials =
				user.name
					?.split(" ")
					.map((w: string) => w[0])
					.join("")
					.toUpperCase() || "NB";

			const newThread = {
				id: newThreadId,
				otherUser: {
					id: id,
					name: user.name,
					image: user.image,
					initials,
				},
				listing: {
					id: firstListing?.id || "listing-table",
					title: firstListing?.title || "Free item",
					imageUrl: firstListing?.images?.[0]?.url || null,
					status: "AVAILABLE" as const,
				},
				lastMessage: {
					body: "Hi! I'm interested in connecting.",
					createdAt: "Just now",
					read: true,
					isMe: true,
				},
				unreadCount: 0,
			};

			// Add to in-memory mock lists
			INITIAL_THREADS.unshift(newThread);
			THREADS_DETAILS[newThreadId] = {
				id: newThreadId,
				otherUser: {
					name: user.name,
					image: user.image,
					initials,
				},
				listing: {
					id: newThread.listing.id,
					title: newThread.listing.title,
					imageUrl: newThread.listing.imageUrl,
					status: "AVAILABLE",
					condition: firstListing?.condition || "GOOD",
				},
			};
			INITIAL_MESSAGES[newThreadId] = [];

			router.push(`/messages/${newThreadId}` as any);
		}
	};

	// Moderation options
	const handleMoreActions = () => {
		Alert.alert(
			"Neighbor Options",
			`What would you like to do regarding ${user.name}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Report Neighbor",
					style: "destructive",
					onPress: () => handleReportUser(),
				},
				{
					text: "Block Neighbor",
					style: "destructive",
					onPress: () => handleBlockUser(),
				},
			],
		);
	};

	const handleBlockUser = () => {
		Alert.alert(
			"Block Neighbor",
			`Are you sure you want to block ${user.name}? You will no longer see their listings or messages.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Block",
					style: "destructive",
					onPress: () => {
						toast.show({
							variant: "success",
							label: `${user.name} has been blocked.`,
						});
						router.back();
					},
				},
			],
		);
	};

	const handleReportUser = () => {
		Alert.alert("Report Neighbor", "Select a reason for reporting this user.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Spam / Fake Account",
				onPress: () => submitReport("SPAM"),
			},
			{
				text: "Inappropriate Content",
				onPress: () => submitReport("INAPPROPRIATE"),
			},
			{
				text: "Other",
				onPress: () => submitReport("OTHER"),
			},
		]);
	};

	const submitReport = (reason: string) => {
		toast.show({
			variant: "success",
			label: `Neighbor reported for: ${reason}. Our moderation team is reviewing it.`,
		});
	};

	const joinedDate = user.createdAt ? new Date(user.createdAt) : new Date();
	const formattedDate = joinedDate.toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	});

	return (
		<View className="flex-1 bg-background">
			{/* Dynamic Scroll Grid Container */}
			<FlatList
				data={neighborListings}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperStyle={{ gap: 16 }}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						tintColor="#316342"
					/>
				}
				ListHeaderComponent={
					<View className="gap-6 pt-3 pb-6">
						{/* Header row */}
						<View className="flex-row items-center justify-between">
							<Pressable
								onPress={() => router.back()}
								className="size-10 items-center justify-center rounded-full border border-border bg-card active:opacity-75"
							>
								<Icon as={ArrowLeft} className="size-5 text-foreground" />
							</Pressable>

							<Pressable
								onPress={handleMoreActions}
								className="size-10 items-center justify-center rounded-full border border-border bg-card active:opacity-75"
							>
								<Icon as={MoreVertical} className="size-5 text-foreground" />
							</Pressable>
						</View>

						{/* Neighbor Info Card */}
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
										Neighbor since {formattedDate}
									</Text>
								</View>
							</View>

							{/* Bio */}
							{user.bio && (
								<Text
									type="body-sm"
									className="mt-4 text-muted-foreground leading-relaxed"
								>
									{user.bio}
								</Text>
							)}
						</Card>

						{/* Section Title */}
						<View className="mt-2 flex-row items-center justify-between">
							<Text type="h4" className="font-bold text-foreground">
								Active Items on the Porch
							</Text>
							{neighborListings.length > 0 && (
								<Badge color="primary" appearance="soft" size="sm">
									<Text className="font-bold text-xs">
										{neighborListings.length}
									</Text>
								</Badge>
							)}
						</View>
					</View>
				}
				ListEmptyComponent={
					isListingsLoading ? (
						<View className="items-center justify-center py-12">
							<Spinner className="size-6 text-primary" />
						</View>
					) : (
						<View className="items-center justify-center py-12 text-center">
							<View className="mb-3 size-12 items-center justify-center rounded-full bg-muted">
								<Icon as={Tag} className="size-6 text-muted-foreground" />
							</View>
							<Text type="body-sm" className="font-bold text-foreground">
								No active items
							</Text>
							<Text
								type="body-xs"
								className="mt-1 px-6 text-center text-muted-foreground"
							>
								This neighbor doesn't have any items available on their porch
								right now.
							</Text>
						</View>
					)
				}
				renderItem={({ item }) => (
					<ListingCard
						item={item}
						onPress={handleListingPress}
						className="flex-1"
					/>
				)}
			/>

			{/* Floating Message Button Footer */}
			<View
				className="absolute right-0 bottom-0 left-0 border-border border-t bg-card px-5 py-3"
				style={{ paddingBottom: Math.max(insets.bottom, 12) }}
			>
				<Button
					appearance="solid"
					color="primary"
					className="flex-row items-center justify-center gap-2 rounded-xl py-4"
					onPress={handleMessageUser}
				>
					<Icon as={MessageSquare} className="size-5 text-white" />
					<Button.Label className="font-bold text-base text-white">
						Message {user.name.split(" ")[0]}
					</Button.Label>
				</Button>
			</View>
		</View>
	);
}
