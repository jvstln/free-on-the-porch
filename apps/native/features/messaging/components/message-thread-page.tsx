import { getInitials } from "@free-on-the-porch/shared/utils";
import { format } from "date-fns";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, Send, Tag } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { KeyboardAvoidingView, View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useUserProfile } from "../../users/hooks/use-user";
import {
	useMarkRead,
	useMessagingSocket,
	useSendMessage,
	useThreadDetails,
	useThreadMessages,
} from "../hooks/use-messaging";

// ─── Main Component ───────────────────────────────────────────────────────────

export function MessageThreadPage({ threadId }: { threadId: string }) {
	const router = useRouter();
	const { backTo } = useLocalSearchParams<{ backTo?: string }>();
	const insets = useSafeAreaInsets();
	const flatListRef = useRef<FlatList>(null);
	const { data: session } = authClient.useSession();

	const isDm = threadId.startsWith("dm-");
	const dmUserId = isDm ? threadId.substring(3) : "";

	const threadDetailsQuery = useThreadDetails(threadId);
	const dmMessagesQuery = useThreadMessages(dmUserId);
	const userProfileQuery = useUserProfile(dmUserId);

	const conversationResponse = isDm
		? dmMessagesQuery.data
		: threadDetailsQuery.data;
	const conversation = conversationResponse?.data;

	const otherMember = conversation?.members?.[0];

	// Normalize data structure
	const otherUser = {
		id: otherMember?.id || dmUserId || "",
		name: otherMember?.name || userProfileQuery.data?.name || "Neighbor",
		image: otherMember?.image || userProfileQuery.data?.image || null,
		initials: getInitials(
			otherMember?.name || userProfileQuery.data?.name || "Neighbor",
		),
	};

	const listing = conversation?.listing || null;
	const messages = conversation?.messages || [];
	const listingImageUrl = listing?.images?.[0]?.url;

	const otherUserId = otherUser.id;

	// Enable Socket connection for real-time notifications
	useMessagingSocket(otherUserId, threadId);

	// Message sending mutation
	const sendMessageMutation = useSendMessage(otherUserId, threadId);
	const markReadMutation = useMarkRead();

	const [input, setInput] = useState("");

	useEffect(() => {
		// Mark thread as read on load/updates
		if (otherUserId) {
			markReadMutation.mutate({
				senderId: otherUserId,
				threadId:
					threadId && !threadId.startsWith("dm-") ? threadId : undefined,
			});
		}
	}, [otherUserId, threadId]);

	useEffect(() => {
		// Scroll to bottom on initial render/new messages
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages.length]);

	const handleSend = () => {
		if (!input.trim()) return;
		const body = input.trim();
		setInput("");

		sendMessageMutation.mutate(body, {
			onSuccess: () => {
				// Scroll to bottom
				setTimeout(() => {
					flatListRef.current?.scrollToEnd({ animated: true });
				}, 100);
			},
		});
	};

	return (
		<KeyboardAvoidingView className="flex-1 bg-background">
			{/* Thread Header */}
			<View
				className="flex-row items-center border-border border-b bg-card px-4 py-3"
				style={{ paddingTop: Math.max(insets.top, 12) }}
			>
				<Pressable
					onPress={() => {
						if (backTo) {
							router.navigate(backTo as Href);
						} else if (router.canGoBack()) {
							router.back();
						} else {
							router.replace("/dashboard/messages");
						}
					}}
					className="mr-3 active:opacity-70"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>

				<Pressable
					onPress={() => {
						if (otherUserId) {
							router.push({
								pathname: "/dashboard/user/[id]",
								params: { id: otherUserId },
							});
						}
					}}
					className="flex-1 flex-row items-center active:opacity-75"
				>
					<Avatar className="size-10 rounded-full">
						{otherUser.image ? (
							<Avatar.Image src={otherUser.image} />
						) : (
							<Avatar.Fallback>{otherUser.initials}</Avatar.Fallback>
						)}
					</Avatar>

					<View className="ml-3 flex-1">
						<Text type="body-sm" className="font-bold text-foreground">
							{otherUser.name}
						</Text>
						<Text type="body-xs" className="text-muted-foreground">
							Online now
						</Text>
					</View>
				</Pressable>
			</View>

			{/* Listing Context Banner */}
			{listing && (
				<Pressable
					onPress={() =>
						router.push({
							pathname: "/dashboard/listings/[id]",
							params: {
								id: listing.id,
								backTo: `/dashboard/messages/${threadId}`,
							},
						})
					}
					className="flex-row items-center justify-between border-border border-b bg-primary/5 px-4 py-2.5 active:bg-primary/10"
				>
					<View className="flex-1 flex-row items-center gap-2">
						{listingImageUrl ? (
							<Image
								source={{ uri: listingImageUrl }}
								className="size-10 rounded-md bg-muted"
								contentFit="cover"
							/>
						) : (
							<View className="size-10 items-center justify-center rounded-md bg-muted">
								<Icon as={Tag} className="size-5 text-muted-foreground" />
							</View>
						)}
						<View className="flex-1">
							<Text
								type="body-xs"
								className="font-bold text-secondary uppercase tracking-wide"
							>
								Regarding:
							</Text>
							<Text
								type="body-sm"
								className="font-semibold text-foreground"
								numberOfLines={1}
							>
								{listing.title}
							</Text>
						</View>
					</View>
					<View className="flex-row items-center gap-1">
						<Badge
							color={listing.status === "AVAILABLE" ? "primary" : "neutral"}
							appearance="soft"
							size="sm"
						>
							<Text className="font-bold text-[10px] uppercase">
								{listing.status === "AVAILABLE" ? "Available" : "Claimed"}
							</Text>
						</Badge>
						<Icon as={ChevronRight} className="size-4 text-muted-foreground" />
					</View>
				</Pressable>
			)}

			{/* Chat Bubbles */}
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-4 py-5 gap-3"
				renderItem={({ item }) => {
					const isMe = item.senderId === session?.user?.id;
					const formattedTime = format(new Date(item.createdAt), "h:mm a");
					return (
						<View
							className={cn(
								"max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
								isMe
									? "self-end rounded-tr-none bg-primary"
									: "self-start rounded-tl-none border border-border bg-card",
							)}
						>
							<Text
								type="body-sm"
								className={isMe ? "text-primary-foreground" : "text-foreground"}
							>
								{item.body}
							</Text>
							<View className="mt-1 flex-row items-center justify-end gap-1.5">
								<Text
									type="body-xs"
									className={cn(
										"text-[9px]",
										isMe
											? "text-primary-foreground/75"
											: "text-muted-foreground/75",
									)}
								>
									{formattedTime}
								</Text>
								{isMe && (
									<Text className="font-medium text-[9px] text-primary-foreground/60">
										{item.read ? "Seen" : "Sent"}
									</Text>
								)}
							</View>
						</View>
					);
				}}
			/>

			{/* Message Input Compose Bar */}
			<View
				className="flex-row items-center gap-2 border-border border-t bg-card px-4 py-3"
				style={{ paddingBottom: Math.max(insets.bottom, 12) }}
			>
				<TextInput
					className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 font-medium text-foreground text-sm"
					placeholder="Type a neighborly message..."
					placeholderTextColor="#A89880"
					value={input}
					onChangeText={setInput}
					onSubmitEditing={handleSend}
					returnKeyType="send"
				/>
				<Button
					color="primary"
					appearance="solid"
					className="h-10 w-10 items-center justify-center rounded-full p-0"
					onPress={handleSend}
					disabled={!input.trim()}
				>
					<Icon as={Send} className="size-5 text-white" />
				</Button>
			</View>
		</KeyboardAvoidingView>
	);
}
