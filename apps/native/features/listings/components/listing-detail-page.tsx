import type {
	ListingCategoryType,
	ListingConditionType,
} from "@free-on-the-porch/shared/schemas";
import { useRouter } from "expo-router";
import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	Edit,
	MapPin,
	MessageSquare,
	Tag,
	Trash2,
	User as UserIcon,
} from "lucide-react-native";
import { useRef, useState } from "react";
import { Alert, Dimensions, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { ImageViewer } from "@/components/ui/image-viewer";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { ScrollView, View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";
import { resolveColorAlias } from "@/lib/colors.util";
import {
	CATEGORY_LABEL,
	CONDITION_LABEL,
} from "../constants/listings.constants";
import {
	useDeleteListing,
	useListingDetail,
	useUpdateListing,
} from "../hooks/use-listings";

type Props = {
	id: string;
};

const MAP_MOCK =
	"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/pickup_map_mock_1780101925282.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ListingDetailPage({ id }: Props) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useToast();
	const { data: session } = authClient.useSession();

	const { data: listing, isLoading, error } = useListingDetail(id);
	const updateMutation = useUpdateListing(id);
	const deleteMutation = useDeleteListing();

	const [viewerVisible, setViewerVisible] = useState(false);
	const [activeImageIndex, setActiveImageIndex] = useState(0);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: any[] }) => {
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
				<Button onPress={() => router.back()} variant="primary">
					<Button.Label>Go Back</Button.Label>
				</Button>
			</View>
		);
	}

	const isOwner = session?.user?.id === listing.userId;
	const isAvailable = listing.status === "AVAILABLE";

	// Handlers
	const handleClaim = () => {
		// Redirect to message flow
		router.push({
			pathname: "/dashboard/messages",
			params: {
				userId: listing.userId,
				listingId: listing.id,
				userName: listing.user?.name || "Neighbor",
			},
		});
	};

	const handleMarkPickedUp = async () => {
		try {
			await updateMutation.mutateAsync({ status: "PICKED_UP" });
			toast.show({
				variant: "success",
				label: "Listing marked as Picked Up!",
			});
		} catch (_err) {
			toast.show({
				variant: "danger",
				label: "Failed to update listing status.",
			});
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
							toast.show({
								variant: "success",
								label: "Listing deleted successfully.",
							});
							router.back();
						} catch (_err) {
							toast.show({
								variant: "danger",
								label: "Failed to delete listing.",
							});
						}
					},
				},
			],
		);
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
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
				<View className="relative h-80 w-full bg-muted">
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
						<View className="flex-1 items-center justify-center gap-2">
							<Icon as={Tag} className="size-16 text-muted-foreground" />
							<Text type="body-sm" className="text-muted-foreground">
								No photos uploaded
							</Text>
						</View>
					)}

					{/* Floating Header Actions */}
					<View
						className="absolute right-4 left-4 z-50 flex-row justify-between"
						style={{ top: Math.max(insets.top, 16) }}
					>
						{/* Back Button */}
						<Pressable
							onPress={() => router.back()}
							className="size-10 items-center justify-center rounded-full bg-background/90 shadow-black/20 shadow-md active:bg-background"
						>
							<Icon as={ChevronLeft} className="size-6 text-foreground" />
						</Pressable>
					</View>

					{/* Status Overlay */}
					{!isAvailable && (
						<View className="absolute inset-0 z-40 items-center justify-center bg-black/40">
							<Text
								type="h3"
								className="font-extrabold text-white uppercase tracking-wider"
							>
								{listing.status === "PICKED_UP" ? "Picked Up" : "Unavailable"}
							</Text>
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
							{CATEGORY_LABEL[listing.category as ListingCategoryType]}
						</Text>

						<View className="flex-row gap-2">
							<Badge
								color={resolveColorAlias(listing.condition)}
								appearance="solid"
								size="sm"
							>
								<Text className="font-bold text-xs uppercase">
									{CONDITION_LABEL[listing.condition as ListingConditionType]}
								</Text>
							</Badge>

							{listing.status !== "AVAILABLE" && (
								<Badge color="neutral" appearance="soft" size="sm">
									<Text className="font-bold text-xs uppercase">
										{listing.status}
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
						onPress={() => router.push(`/user/${listing.userId}` as any)}
						className="flex-row items-center gap-3 border-border border-t border-b py-4 active:bg-muted/20"
					>
						{listing.user?.image ? (
							<Image
								source={{ uri: listing.user.image }}
								className="size-12 rounded-full bg-muted"
								contentFit="cover"
							/>
						) : (
							<View className="size-12 items-center justify-center rounded-full bg-muted">
								<Icon as={UserIcon} className="size-6 text-muted-foreground" />
							</View>
						)}
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
									Active since {formatDate(listing.createdAt)}
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

						<Card className="relative h-48 w-full overflow-hidden rounded-2xl border border-border bg-muted p-0 shadow-sm">
							<Image
								source={{ uri: MAP_MOCK }}
								className="h-full w-full opacity-90"
								contentFit="cover"
							/>
							{/* Location overlay */}
							<View className="absolute right-3 bottom-3 left-3 flex-row items-center gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-sm">
								<Icon as={MapPin} className="size-5 text-primary" />
								<Text
									type="body-xs"
									className="flex-1 font-semibold text-foreground"
								>
									{listing.address || "Maplewood Neighborhood"}
								</Text>
							</View>
						</Card>
					</View>
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
							appearance="soft"
							color="neutral"
							className="items-center justify-center rounded-xl px-4 py-3.5"
							onPress={() => router.push(`/listings/${listing.id}/edit` as any)}
						>
							<Icon as={Edit} className="size-5" />
						</Button>
						{isAvailable && (
							<Button
								appearance="solid"
								color="primary"
								className="flex-1 rounded-xl py-3.5"
								onPress={handleMarkPickedUp}
								isLoading={updateMutation.isPending}
							>
								<Icon as={CheckCircle} className="size-5" />
								<Button.Label className="font-bold">
									Mark Picked Up
								</Button.Label>
							</Button>
						)}
						<Button
							appearance="soft"
							color="destructive"
							className="items-center justify-center rounded-xl px-4 py-3.5"
							onPress={handleDelete}
							isLoading={deleteMutation.isPending}
						>
							<Icon as={Trash2} className="size-5" />
						</Button>
					</View>
				) : (
					// Public Claim
					<Button
						appearance="solid"
						color="primary"
						className="flex-1 rounded-xl py-4"
						disabled={!isAvailable}
						onPress={handleClaim}
					>
						<Icon as={MessageSquare} className="size-5" />
						<Button.Label className="font-bold">
							{isAvailable ? "Message Owner to Claim" : "Already Picked Up"}
						</Button.Label>
					</Button>
				)}
			</View>

			<ImageViewer
				images={listing.images?.map((img: any) => img.url) || []}
				visible={viewerVisible}
				onClose={() => setViewerVisible(false)}
				initialIndex={activeImageIndex}
			/>
		</View>
	);
}
