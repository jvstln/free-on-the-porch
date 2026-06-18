import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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
import { cn } from "@/lib/utils";
import {
	AUTO_REPLIES,
	INITIAL_MESSAGES,
	INITIAL_THREADS,
	type Message,
	THREADS_DETAILS,
} from "../../mock/mock-data";
import {
	messagingKeys,
	useMessagingSocket,
	useSendMessage,
	useThreadMessages,
} from "../hooks/use-messaging";

// ─── Main Component ───────────────────────────────────────────────────────────

export function MessageThreadPage({ threadId }: { threadId: string }) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const flatListRef = useRef<FlatList>(null);
	const queryClient = useQueryClient();

	const thread = THREADS_DETAILS[threadId] || THREADS_DETAILS["thread-1"];

	// Get messages via TanStack Query hook
	const { data: messages = [] } = useThreadMessages(
		thread.otherUser.name.toLowerCase().replace(" ", "-"), // map mock name to id format
		thread.listing.id,
	);

	// In the real app, thread.otherUser.id is used:
	const otherUserId = thread.otherUser.name.toLowerCase().replace(" ", "-");

	// Enable Socket connection for real-time notifications
	useMessagingSocket(otherUserId);

	// Message sending mutation
	const sendMessageMutation = useSendMessage(otherUserId, thread.listing.id);

	const [input, setInput] = useState("");

	useEffect(() => {
		// Scroll to bottom on initial render
		setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: false });
		}, 100);
	}, []);

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

				// Offline Mock Chatbot Auto Reply after 1.5 seconds
				setTimeout(() => {
					const randomReply =
						AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
					const replyMsg: Message = {
						id: `m-reply-${Date.now()}`,
						body: randomReply,
						createdAt: new Date().toLocaleTimeString(undefined, {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						}),
						isMe: false,
						read: true,
					};

					// Update local mock data state for inbox listings
					if (!INITIAL_MESSAGES[threadId]) {
						INITIAL_MESSAGES[threadId] = [];
					}
					INITIAL_MESSAGES[threadId].push(replyMsg);

					// Also update last message of the thread list item
					const t = INITIAL_THREADS.find((item) => item.id === threadId);
					if (t) {
						t.lastMessage = {
							body: randomReply,
							createdAt: "Just now",
							read: false,
							isMe: false,
						};
						t.unreadCount += 1;
					}

					// Invalidate queries so TanStack Query triggers a re-render
					queryClient.invalidateQueries({ queryKey: messagingKeys.inbox });
					queryClient.invalidateQueries({
						queryKey: messagingKeys.thread(otherUserId),
					});

					// Scroll to bottom after new message mounts
					setTimeout(() => {
						flatListRef.current?.scrollToEnd({ animated: true });
					}, 100);
				}, 1500);
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
					onPress={() => router.back()}
					className="mr-3 active:opacity-70"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>

				<Pressable
					onPress={() => router.push(`/user/${otherUserId}` as any)}
					className="flex-1 flex-row items-center active:opacity-75"
				>
					<Avatar className="size-10 rounded-full">
						{thread.otherUser.image ? (
							<Avatar.Image src={thread.otherUser.image} />
						) : (
							<Avatar.Fallback>{thread.otherUser.initials}</Avatar.Fallback>
						)}
					</Avatar>

					<View className="ml-3 flex-1">
						<Text type="body-sm" className="font-bold text-foreground">
							{thread.otherUser.name}
						</Text>
						<Text type="body-xs" className="text-muted-foreground">
							Online now
						</Text>
					</View>
				</Pressable>
			</View>

			{/* Listing Context Banner */}
			<Pressable
				onPress={() => router.push(`/listings/${thread.listing.id}` as any)}
				className="flex-row items-center justify-between border-border border-b bg-primary/5 px-4 py-2.5 active:bg-primary/10"
			>
				<View className="flex-1 flex-row items-center gap-2">
					{thread.listing.imageUrl ? (
						<Image
							source={{ uri: thread.listing.imageUrl }}
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
							{thread.listing.title}
						</Text>
					</View>
				</View>
				<View className="flex-row items-center gap-1">
					<Badge
						color={
							thread.listing.status === "AVAILABLE" ? "primary" : "neutral"
						}
						appearance="soft"
						size="sm"
					>
						<Text className="font-bold text-[10px] uppercase">
							{thread.listing.status === "AVAILABLE" ? "Available" : "Claimed"}
						</Text>
					</Badge>
					<Icon as={ChevronRight} className="size-4 text-muted-foreground" />
				</View>
			</Pressable>

			{/* Chat Bubbles */}
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-4 py-5 gap-3"
				renderItem={({ item }) => {
					const isMe = item.isMe;
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
									{item.createdAt}
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
