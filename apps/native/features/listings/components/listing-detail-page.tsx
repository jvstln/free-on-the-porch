import { getInitials } from "@free-on-the-porch/shared/utils";
import { format } from "date-fns";
import { router } from "expo-router";
import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	Edit,
	MessageSquare,
	Tag,
	Trash2,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
	Alert,
	Dimensions,
	FlatList,
	Pressable,
	type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { ImageViewer } from "@/components/ui/image-viewer";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { ScrollView, View } from "@/components/ui/view";
import { AuthGuardPressable } from "@/features/auth/components/auth-guard";
import { authClient } from "@/lib/auth-client";
import { resolveColorAlias } from "@/lib/colors.util";
import {
	CATEGORY_LABEL,
	CONDITION_LABEL,
} from "../constants/listings.constants";
import {
	useClaimListing,
	useDeleteListing,
	useListingDetail,
	useUpdateListing,
} from "../hooks/use-listings";
import { CommentSection } from "./comment-section";
import { ListingLocationMap } from "./listing-location-map";

type Props = {
	id: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ListingDetailPage({ id }: Props) {
	const insets = useSafeAreaInsets();
	const { data: session } = authClient.useSession();

	const { data: listing, isLoading, error } = useListingDetail(id);
	const updateMutation = useUpdateListing(id);
	const deleteMutation = useDeleteListing();
	const claimMutation = useClaimListing(id);

	const [viewerVisible, setViewerVisible] = useState(false);
	const [activeImageIndex, setActiveImageIndex] = useState(0);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0]?.index !== null) {
				setActiveImageIndex(viewableItems[0].index ?? 0);
			}
		},
	);

	const viewabilityConfig = useRef({
		viewAreaCoveragePercentThreshold: 50,
	});

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner className="size-8 text-primary" />
				<Text type="body-sm" className="mt-4 text-muted-foreground">
					Fetching listing details...
				</Text>
			</View>
		);
	}

	if (error || !listing) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Text type="h4" className="mb-2 font-bold text-foreground">
					Unable to load listing
				</Text>
				<Text type="body-sm" className="mb-6 text-center text-muted-foreground">
					The listing may have been removed or is no longer available.
				</Text>
				<Button onPress={() => router.navigate("/dashboard/listings")}>
					Back to listings
				</Button>
			</View>
		);
	}

	const isOwner = session?.user?.id === listing.userId;
	const isAvailable = listing.status === "AVAILABLE";
	const pendingClaimsCount = listing.pendingClaims?.length || 0;
	const hasRequestedClaim = listing.pendingClaims?.some(
		(c) => c.userId === session?.user?.id,
	);
	const isClaimedByMe = listing.claimedByUserId === session?.user?.id;

	// Handlers
	const navigateToDmThread = async () => {
		router.navigate(
			`/dashboard/messages/dm-${listing.userId}?listingId=${listing.id}`,
		);
	};

	const handleClaim = async () => {
		try {
			const claimThread = await claimMutation.mutateAsync();
			router.push(`/dashboard/messages/${claimThread.id}`);
		} catch {}
	};

	// Determine right button properties based on claim and availability status
	let buttonText = "Claim";
	let buttonColor: "primary" | "neutral" | "warning" = "primary";
	let isButtonDisabled = false;
	let handleButtonPress = handleClaim;

	if (listing.status === "EXPIRED" || listing.status === "REMOVED") {
		buttonText = listing.status === "EXPIRED" ? "Expired" : "Removed";
		buttonColor = "neutral";
		isButtonDisabled = true;
	} else if (isClaimedByMe) {
		if (listing.status === "RESERVED") {
			buttonText = "Reserved for You";
			buttonColor = "warning";
			isButtonDisabled = false;
			handleButtonPress = navigateToDmThread;
		} else if (listing.status === "PICKED_UP") {
			buttonText = "Claimed by You";
			buttonColor = "neutral";
			isButtonDisabled = true;
		}
	} else if (hasRequestedClaim) {
		if (listing.status === "AVAILABLE") {
			buttonText = "Requested";
			buttonColor = "neutral";
			isButtonDisabled = false;
			handleButtonPress = navigateToDmThread;
		} else {
			buttonText =
				listing.status === "RESERVED" ? "Reserved" : "Already Picked Up";
			buttonColor = "neutral";
			isButtonDisabled = true;
		}
	} else {
		if (listing.status === "AVAILABLE") {
			buttonText = "Claim";
			buttonColor = "primary";
			isButtonDisabled = false;
			handleButtonPress = handleClaim;
		} else {
			buttonText =
				listing.status === "RESERVED" ? "Reserved" : "Already Picked Up";
			buttonColor = "neutral";
			isButtonDisabled = true;
		}
	}

	const handleMarkPickedUp = async () => {
		try {
			await updateMutation.mutateAsync({ status: "PICKED_UP" });
			toast.success("Listing marked as Picked Up!");
		} catch (_err) {
			toast.error("Failed to update listing status.");
		}
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete Listing",
			"Are you sure you want to permanently delete this listing?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteMutation.mutateAsync(listing.id);
							toast.success("Listing deleted successfully.");
							router.back();
						} catch (_err) {
							toast.error("Failed to delete listing.");
						}
					},
				},
			],
		);
	};

	return (
		<View className="flex-1 bg-background">
			{/* Scrollable Content */}
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
			>
				{/* Hero Image Section */}
				<View className="relative h-80 w-full overflow-hidden bg-muted">
					{listing.images && listing.images.length > 0 ? (
						<>
							<FlatList
								data={listing.images}
								horizontal
								pagingEnabled
								showsHorizontalScrollIndicator={false}
								onViewableItemsChanged={onViewableItemsChanged.current}
								viewabilityConfig={viewabilityConfig.current}
								keyExtractor={(item, idx) => item.url || String(idx)}
								renderItem={({ item, index }) => (
									<Pressable
										onPress={() => {
											setActiveImageIndex(index);
											setViewerVisible(true);
										}}
										style={{ width: SCREEN_WIDTH }}
										className="h-full"
									>
										<Image
											source={{ uri: item.url }}
											className="h-full w-full"
											contentFit="cover"
										/>
									</Pressable>
								)}
							/>
							{listing.images.length > 1 && (
								<View className="absolute right-4 bottom-10 z-40 rounded-full bg-black/60 px-3 py-1.5">
									<Text type="body-xs" className="font-bold text-white">
										{activeImageIndex + 1} / {listing.images.length}
									</Text>
								</View>
							)}
						</>
					) : (
						<View className="flex-1 items-center justify-center gap-3 rounded-2xl border border-border/10 bg-muted/40 p-6">
							<View className="size-16 items-center justify-center rounded-full bg-muted shadow-sm">
								<Icon as={Tag} className="size-8 text-muted-foreground" />
							</View>
							<Text type="body-sm" className="font-semibold text-foreground">
								No photos uploaded
							</Text>
							<Text
								type="body-xs"
								className="px-4 text-center text-muted-foreground"
							>
								The owner didn't add any images. Ask them for photos via chat!
							</Text>
						</View>
					)}

					{/* Floating Header Actions */}
					<View
						className="absolute right-4 left-4 z-50 flex-row justify-between"
						style={{ top: Math.max(insets.top, 16) }}
					>
						{/* Back Button */}
						<Button
							onPress={() => {
								router.navigate("/dashboard/listings");
							}}
							size="icon-lg"
							color="default"
							className="rounded-full"
						>
							<Icon as={ChevronLeft} className="size-6 text-foreground" />
						</Button>
					</View>

					{/* Status Overlay */}
					{!isAvailable && (
						<View className="absolute inset-0 z-40 items-center justify-center bg-black/50 backdrop-blur-sm">
							<View className="items-center justify-center gap-2 rounded-2xl border border-border/20 bg-background/95 px-6 py-4 shadow-xl">
								<Badge
									color={
										listing.status === "RESERVED" ? "warning" : "destructive"
									}
									appearance="solid"
									size="lg"
									className="rounded-full"
								>
									<Text className="font-bold text-sm uppercase tracking-wide">
										{listing.status === "PICKED_UP" &&
											(isClaimedByMe ? "Claimed by You" : "Picked Up")}
										{listing.status === "RESERVED" &&
											(isClaimedByMe ? "Reserved for You" : "Reserved")}
										{listing.status === "EXPIRED" && "Expired"}
										{listing.status === "REMOVED" && "Removed"}
										{!["PICKED_UP", "RESERVED", "EXPIRED", "REMOVED"].includes(
											listing.status,
										) && "Unavailable"}
									</Text>
								</Badge>
								<Text
									type="body-xs"
									className="px-2 text-center font-medium text-muted-foreground"
								>
									{listing.status === "PICKED_UP" &&
										(isClaimedByMe
											? "You have successfully picked up this item. Enjoy!"
											: "This item has been successfully claimed and picked up.")}
									{listing.status === "RESERVED" &&
										(isClaimedByMe
											? "The owner has reserved this item for you. Coordinate pickup details via chat!"
											: "This item is currently on hold for another neighbor.")}
									{listing.status === "EXPIRED" &&
										"This listing has expired and is no longer active."}
									{listing.status === "REMOVED" &&
										"This listing has been deleted by the owner."}
									{!["PICKED_UP", "RESERVED", "EXPIRED", "REMOVED"].includes(
										listing.status,
									) && "This item is no longer available."}
								</Text>
							</View>
						</View>
					)}
				</View>

				{/* Detail Card Overlay Body */}
				<View className="-mt-6 gap-6 rounded-t-3xl bg-background px-5 pt-6">
					{/* Category and Badges */}
					<View className="flex-row items-center justify-between">
						<Text
							type="body-sm"
							className="font-bold text-muted-foreground uppercase tracking-wider"
						>
							{CATEGORY_LABEL[listing.category]}
						</Text>

						<View className="flex-row gap-2">
							<Badge
								color={resolveColorAlias(listing.condition)}
								appearance="solid"
								size="sm"
							>
								<Text className="font-bold text-xs uppercase">
									{CONDITION_LABEL[listing.condition]}
								</Text>
							</Badge>

							{listing.status !== "AVAILABLE" && (
								<Badge color="neutral" appearance="soft" size="sm">
									<Text className="font-bold text-xs uppercase">
										{listing.status}
									</Text>
								</Badge>
							)}

							{pendingClaimsCount > 0 && (
								<Badge color="warning" appearance="soft" size="sm">
									<Text className="font-bold text-xs uppercase">
										{pendingClaimsCount}{" "}
										{pendingClaimsCount === 1 ? "Request" : "Requests"}
									</Text>
								</Badge>
							)}
						</View>
					</View>

					{/* Title */}
					<View>
						<Text
							type="h2"
							className="font-extrabold text-3xl text-foreground leading-tight"
						>
							{listing.title}
						</Text>
					</View>

					{/* Poster Profile Row */}
					<Pressable
						onPress={() => router.push(`/dashboard/user/${listing.userId}`)}
						className="flex-row items-center gap-3 border-border border-t border-b py-4 active:bg-muted/20"
					>
						<Avatar>
							<Avatar.Image src={listing.user?.image} />
							<Avatar.Fallback>
								{getInitials(listing.user?.name ?? "")}
							</Avatar.Fallback>
						</Avatar>
						<View className="flex-1 justify-center">
							<Text type="body-sm" className="font-bold text-foreground">
								Posted by {listing.user?.name || "Neighbor"}
							</Text>
							<View className="mt-0.5 flex-row items-center gap-1.5">
								<Icon
									as={Calendar}
									className="size-3.5 text-muted-foreground"
								/>
								<Text type="body-xs" className="text-muted-foreground">
									Posted on {format(listing.createdAt, "MMM d, yyyy")}
								</Text>
							</View>
						</View>
					</Pressable>

					{/* Description */}
					<View className="gap-2">
						<Text type="body-sm" className="font-bold text-secondary">
							Description
						</Text>
						<Text type="body-sm" className="text-foreground leading-relaxed">
							{listing.description || "No description provided for this item."}
						</Text>
					</View>

					{/* Pickup Location Map */}
					<View className="gap-3">
						<Text type="body-sm" className="font-bold text-secondary">
							Estimated Pickup Area
						</Text>

						<ListingLocationMap
							location={listing.location ?? null}
							address={listing.address ?? null}
						/>
					</View>
				</View>

				{/* Comments Section */}
				<View className="mt-6 px-5">
					<Text type="h4" className="mb-4 font-bold text-foreground">
						Comments
					</Text>
					<CommentSection
						listingId={listing.id}
						currentUserId={session?.user?.id}
					/>
				</View>
			</ScrollView>

			{/* Floating Bottom Action Footer */}
			<View
				className="absolute right-0 bottom-0 left-0 flex-row items-center justify-between gap-3 border-border border-t bg-card px-5 py-3"
				style={{ paddingBottom: Math.max(insets.bottom, 12) }}
			>
				{isOwner ? (
					// Owner Actions
					<View className="flex-1 flex-row gap-3">
						<Button
							appearance="outline"
							onPress={() =>
								router.push(`/dashboard/listings/${listing.id}/edit`)
							}
						>
							<Icon as={Edit} />
						</Button>
						{isAvailable && (
							<Button
								className="flex-1"
								onPress={handleMarkPickedUp}
								isLoading={updateMutation.isPending}
							>
								<Icon as={CheckCircle} />
								Mark Picked Up
							</Button>
						)}
						<Button
							appearance="outline"
							color="destructive"
							onPress={handleDelete}
							isLoading={deleteMutation.isPending}
						>
							<Icon as={Trash2} />
						</Button>
					</View>
				) : (
					// Public Claim & Message Owner
					<View className="flex-1 flex-row gap-3">
						<AuthGuardPressable>
							<Button
								appearance="outline"
								onPress={() => {
									navigateToDmThread();
								}}
							>
								<Icon as={MessageSquare} className="size-5" />
							</Button>
						</AuthGuardPressable>

						<AuthGuardPressable>
							<Button
								appearance="solid"
								color={buttonColor}
								disabled={isButtonDisabled}
								onPress={handleButtonPress}
								isLoading={claimMutation.isPending}
							>
								<Icon as={CheckCircle} />
								{buttonText}
							</Button>
						</AuthGuardPressable>
					</View>
				)}
			</View>

			<ImageViewer
				images={listing.images?.map((img) => img.url) || []}
				visible={viewerVisible}
				onClose={() => setViewerVisible(false)}
				initialIndex={activeImageIndex}
			/>
		</View>
	);
}
