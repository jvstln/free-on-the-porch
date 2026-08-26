import type { ThreadDto } from "@free-on-the-porch/shared/schemas";
import { useRouter } from "expo-router";
import {
	ArrowLeft,
	Inbox,
	MessageSquare,
	Search,
	X,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlatList } from "@/components/ui/flat-list";
import { Icon } from "@/components/ui/icon";
import { SearchInput } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Text } from "@/components/ui/text";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { View } from "@/components/ui/view";
import {
	useInboxThreads,
	useMarkRead,
	useMessagingSocket,
} from "../hooks/use-messaging";
import { ThreadListItem } from "./thread-list-item";

export function MessagesPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"dm" | "threads">("dm");
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const {
		data: threadsResponse,
		refetch,
		isRefetching,
	} = useInboxThreads({
		type: activeTab === "dm" ? "DM" : "LISTING",
	});
	const threads = threadsResponse?.data || [];
	const markReadMutation = useMarkRead();

	// Listen to real-time message changes
	useMessagingSocket();

	const handleThreadPress = (thread: ThreadDto) => {
		const contactUser = thread.members?.[0];
		const lastMessage = thread.messages?.[0];

		// Mark thread as read
		if (lastMessage && contactUser) {
			markReadMutation.mutate({
				senderId: contactUser.id,
				threadId: thread.id,
			});
		}

		// Navigate to detailed chat route
		router.push(`/dashboard/messages/${thread.id}` as any);
	};

	const filteredThreads = threads.filter((t) => {
		// Filter by DM or Threads (as safety fallback)
		if (activeTab === "dm" && t.type !== "DM") {
			return false;
		}
		if (activeTab === "threads" && t.type !== "LISTING") {
			return false;
		}

		const contactUser = t.members?.[0];
		const lastMessage = t.messages?.[0];

		// Filter by search query
		const query = searchQuery.toLowerCase();
		return (
			(contactUser && contactUser.name.toLowerCase().includes(query)) ||
			(t.listing?.title && t.listing.title.toLowerCase().includes(query)) ||
			(lastMessage?.body && lastMessage.body.toLowerCase().includes(query))
		);
	});

	return (
		<View className="flex-1 bg-background">
			{/* Header area */}
			<PageHeader>
				{!isSearching ? (
					<>
						{/* Title */}
						<PageHeader.Title>Messages</PageHeader.Title>

						{/* Segmented Control Toggle */}
						<View className="mx-2 ml-auto max-w-[180px] flex-1">
							<ToggleGroup
								value={activeTab}
								onValueChange={(val) => setActiveTab(val as "dm" | "threads")}
								type="segmented"
								size="xs"
							>
								<ToggleGroup.Item value="dm" className="flex-1 py-1">
									DMs
								</ToggleGroup.Item>
								<ToggleGroup.Item value="threads" className="flex-1 py-1">
									Threads
								</ToggleGroup.Item>
							</ToggleGroup>
						</View>

						<Button
							onPress={() => setIsSearching(true)}
							appearance="ghost"
							color="neutral"
							className="rounded-full"
							size="xs"
						>
							<Icon as={Search} />
						</Button>
					</>
				) : (
					/* Search header overlay */
					<View className="flex-1 flex-row items-center gap-3">
						<Button
							onPress={() => {
								setIsSearching(false);
								setSearchQuery("");
							}}
							size="xs"
							color="neutral"
							appearance={"ghost"}
						>
							<Icon as={ArrowLeft} />
						</Button>

						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search neighbor or item..."
							autoFocus
						/>
						{searchQuery.length > 0 && (
							<Pressable
								onPress={() => setSearchQuery("")}
								className="p-1 active:opacity-75"
							>
								<Icon as={X} className="size-4 text-muted-foreground" />
							</Pressable>
						)}
					</View>
				)}
			</PageHeader>

			{/* Thread List */}
			<FlatList
				data={filteredThreads}
				keyExtractor={(item) => item.id}
				contentContainerClassName="pb-10"
				refreshing={isRefetching}
				onRefresh={refetch}
				ListEmptyComponent={
					<EmptyState
						icon={activeTab === "dm" ? MessageSquare : Inbox}
						title={
							activeTab === "dm"
								? "No direct messages yet"
								: "No listing threads yet"
						}
						description={
							activeTab === "dm"
								? "Direct message conversations with your neighbors will show up here."
								: "Claim threads or inquiries on your free items will appear here."
						}
					/>
				}
				renderItem={({ item }) => (
					<ThreadListItem thread={item} onPress={handleThreadPress} />
				)}
			/>
		</View>
	);
}
