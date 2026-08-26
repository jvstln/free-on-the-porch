import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { SearchInput } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { UserMenu } from "@/features/users/components/user-menu";
import { cn } from "@/lib/utils";
import type { Thread } from "../../mock/mock-data";
import {
	useInboxThreads,
	useMarkRead,
	useMessagingSocket,
} from "../hooks/use-messaging";

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
	return (
		<View className="flex-1 items-center justify-center px-6 py-20">
			<View className="mb-4 size-16 items-center justify-center rounded-full bg-muted">
				<Icon as={MessageSquare} className="size-8 text-muted-foreground" />
			</View>
			<Text type="h4" className="mb-2 font-bold text-foreground">
				No messages yet
			</Text>
			<Text type="body-sm" className="text-center text-muted-foreground">
				When you claim a free item or get inquiries on yours, your chats will
				appear here.
			</Text>
		</View>
	);
}

// ─── Thread List Item ──────────────────────────────────────────────────────────

type ThreadItemProps = {
	thread: Thread;
	onPress: (threadId: string) => void;
};

function ThreadListItem({ thread, onPress }: ThreadItemProps) {
	const hasUnread = thread.unreadCount > 0;
	const lastMsg = thread.lastMessage;

	return (
		<Pressable
			onPress={() => onPress(thread.id)}
			className={cn(
				"flex-row items-center border-border border-b bg-card p-4 transition-all active:bg-muted/30",
				hasUnread ? "bg-primary/5" : "bg-card",
			)}
		>
			{/* User Avatar */}
			<View className="relative">
				<Avatar className="size-12 rounded-full">
					{thread.otherUser.image ? (
						<Avatar.Image src={thread.otherUser.image} />
					) : (
						<Avatar.Fallback>{thread.otherUser.initials}</Avatar.Fallback>
					)}
				</Avatar>
				{hasUnread && (
					<View className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-primary" />
				)}
			</View>

			{/* Middle Content: User Name, Listing Context, Message Preview */}
			<View className="mx-3 flex-1">
				<View className="flex-row items-baseline justify-between">
					<Text
						type="body-sm"
						className={cn(
							"text-foreground",
							hasUnread ? "font-bold text-primary" : "font-semibold",
						)}
					>
						{thread.otherUser.name}
					</Text>
					<Text type="body-xs" className="text-muted-foreground">
						{lastMsg.createdAt}
					</Text>
				</View>

				{/* Listing Context Chip */}
				<View className="mt-1 flex-row items-center gap-1">
					<Text
						type="body-xs"
						className="font-bold text-[#795932] uppercase tracking-wider"
						numberOfLines={1}
					>
						{thread.listing.title}
					</Text>
					{thread.listing.status === "PICKED_UP" && (
						<Badge
							color="neutral"
							appearance="soft"
							size="sm"
							className="px-1.5 py-0"
						>
							<Text className="font-bold text-[9px] uppercase">Claimed</Text>
						</Badge>
					)}
				</View>

				<Text
					type="body-sm"
					className={cn(
						"mt-1 text-muted-foreground",
						hasUnread ? "font-medium text-foreground" : "font-normal",
					)}
					numberOfLines={1}
				>
					{lastMsg.isMe ? `You: ${lastMsg.body}` : lastMsg.body}
				</Text>
			</View>

			{/* Listing Thumbnail Right */}
			{thread.listing.imageUrl ? (
				<Image
					source={{ uri: thread.listing.imageUrl }}
					className="size-12 rounded-lg bg-muted"
					contentFit="cover"
				/>
			) : (
				<View className="size-12 items-center justify-center rounded-lg bg-muted">
					<Icon as={MessageSquare} className="size-5 text-muted-foreground" />
				</View>
			)}
		</Pressable>
	);
}

// ─── Main Inbox Component ──────────────────────────────────────────────────────

export function InboxPage() {
	const router = useRouter();
	const { data: threads = [], refetch, isRefetching } = useInboxThreads();
	const markReadMutation = useMarkRead();
	const [searchQuery, setSearchQuery] = useState("");

	// Listen to real-time message changes
	useMessagingSocket();

	const handleThreadPress = (threadId: string) => {
		// Mark thread as read
		const thread = threads.find((t) => t.id === threadId);
		if (thread) {
			markReadMutation.mutate(thread.otherUser.id);
		}

		// Navigate to detailed chat route
		router.push(`/messages/${threadId}` as any);
	};

	const filteredThreads = threads.filter((t) => {
		const query = searchQuery.toLowerCase();
		return (
			t.otherUser.name.toLowerCase().includes(query) ||
			t.listing.title.toLowerCase().includes(query) ||
			t.lastMessage.body.toLowerCase().includes(query)
		);
	});

	return (
		<View className="flex-1 bg-background">
			{/* Inbox Header */}
			<View className="flex-row items-center justify-between border-border border-b bg-card px-4 py-3">
				<Text type="h3" className="font-bold text-primary">
					Inbox
				</Text>
				<UserMenu />
			</View>

			{/* Search */}
			<View className="px-4 py-2">
				<SearchInput
					placeholder="Search neighbor or item..."
					value={searchQuery}
					onChange={setSearchQuery}
				/>
			</View>

			{/* Thread List */}
			<FlatList
				data={filteredThreads}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-10"
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
						tintColor="#316342"
						colors={["#316342"]}
					/>
				}
				ListEmptyComponent={<EmptyState />}
				renderItem={({ item }) => (
					<ThreadListItem thread={item} onPress={handleThreadPress} />
				)}
			/>
		</View>
	);
}
