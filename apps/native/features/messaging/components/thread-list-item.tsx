import type { ThreadDto } from "@free-on-the-porch/shared/schemas";
import { getInitials } from "@free-on-the-porch/shared/utils";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react-native";
import { Pressable } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export type ThreadListItemProps = {
	thread: ThreadDto;
	onPress: (thread: ThreadDto) => void;
};

export function ThreadListItem({ thread, onPress }: ThreadListItemProps) {
	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id;

	const lastMessage = thread.messages?.[0];
	const contactUser = thread.members?.[0];

	const isMe = lastMessage?.senderId === currentUserId;
	const hasUnread = !lastMessage?.read && !isMe;

	const initials = contactUser ? getInitials(contactUser.name) : "";
	const formattedTime = lastMessage
		? formatDistanceToNow(new Date(lastMessage.createdAt), {
				addSuffix: true,
			})
		: "";

	const listingTitle = thread.listing?.title;
	const listingStatus = thread.listing?.status;
	const isOwner = thread.listing
		? thread.listing.userId === currentUserId
		: false;
	const imageUrl = thread.listing?.images?.[0]?.url;

	return (
		<Pressable
			onPress={() => onPress(thread)}
			className={cn(
				"flex-row items-center border-border border-b bg-card p-4 transition-all active:bg-muted/30",
				hasUnread ? "bg-primary/5" : "bg-card",
			)}
		>
			{/* User Avatar */}
			<View className="relative">
				<Avatar className="size-12 rounded-full">
					<Avatar.Image src={contactUser?.image ?? undefined} />
					<Avatar.Fallback>{initials}</Avatar.Fallback>
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
						{contactUser?.name}
					</Text>
					<Text type="body-xs" className="text-muted-foreground">
						{formattedTime}
					</Text>
				</View>

				{/* Listing Context Chip & Owner/Claimant Status */}
				{listingTitle && (
					<View className="mt-1 flex-row flex-wrap items-center gap-1.5">
						<Text
							type="body-xs"
							className="max-w-[120px] font-bold text-secondary uppercase tracking-wider"
							numberOfLines={1}
						>
							{listingTitle}
						</Text>
						{listingStatus === "PICKED_UP" && (
							<Badge
								color="neutral"
								appearance="soft"
								size="sm"
								className="px-1.5 py-0"
							>
								<Text className="font-bold text-[9px] uppercase">Claimed</Text>
							</Badge>
						)}
						{thread.listing && (
							<Badge
								color={isOwner ? "primary" : "neutral"}
								appearance="soft"
								size="sm"
								className="px-1.5 py-0"
							>
								<Text className="font-bold text-[9px] uppercase">
									{isOwner ? "My Listing" : "Claiming"}
								</Text>
							</Badge>
						)}
					</View>
				)}

				<Text
					type="body-sm"
					className={cn(
						"mt-1 text-muted-foreground",
						hasUnread ? "font-medium text-foreground" : "font-normal",
					)}
					numberOfLines={1}
				>
					{lastMessage
						? isMe
							? `You: ${lastMessage.body}`
							: lastMessage.body
						: ""}
				</Text>
			</View>

			{/* Listing Thumbnail Right */}
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					className="size-12 rounded-lg bg-muted"
					contentFit="cover"
				/>
			) : thread.listing?.id ? (
				<View className="size-12 items-center justify-center rounded-lg bg-muted">
					<Icon as={MessageSquare} className="size-5 text-muted-foreground" />
				</View>
			) : null}
		</Pressable>
	);
}
