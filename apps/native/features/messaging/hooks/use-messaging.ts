import type { ThreadsQueryDto } from "@free-on-the-porch/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { messagingSocket } from "@/lib/socket-client";
import { messagingService } from "../messaging.api";

// Query keys
export const messagingKeys = {
	inbox: (query?: ThreadsQueryDto) => ["messaging", "inbox", query] as const,
	conversation: (type: "threads" | "listings" | "users", id: string) =>
		["messaging", "conversation", type, id] as const,
};

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

export const useInboxThreads = (query?: ThreadsQueryDto) => {
	return useQuery({
		queryKey: messagingKeys.inbox(query),
		queryFn: () => messagingService.getInbox(query),
	});
};

export const useThreadDetails = (threadId: string) => {
	return useQuery({
		queryKey: messagingKeys.conversation("threads", threadId),
		queryFn: () =>
			messagingService.getConversation({ type: "threads", id: threadId }),
		enabled: !!threadId && !threadId.startsWith("dm-"),
	});
};

export const useThreadMessages = (otherUserId: string) => {
	return useQuery({
		queryKey: messagingKeys.conversation("users", otherUserId),
		queryFn: () =>
			messagingService.getConversation({ type: "users", id: otherUserId }),
		enabled: !!otherUserId,
	});
};

export const useSendMessage = (otherUserId?: string, threadId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: string) => {
			const isListingThread = !!threadId && !threadId.startsWith("dm-");
			return messagingService.sendMessage({
				// threadId/listingId/receiverId are mutually exclusive: use the
				// existing thread when we have one, otherwise fall back to the
				// DM receiver.
				...(isListingThread
					? { threadId }
					: otherUserId
						? { receiverId: otherUserId }
						: {}),
				body,
			});
		},
		onSuccess: (_newMessage) => {
			// Invalidate inbox and current thread to refresh UI
			queryClient.invalidateQueries({ queryKey: ["messaging", "inbox"] });
			if (threadId && !threadId.startsWith("dm-")) {
				queryClient.invalidateQueries({
					queryKey: messagingKeys.conversation("threads", threadId),
				});
			}
			if (otherUserId) {
				queryClient.invalidateQueries({
					queryKey: messagingKeys.conversation("users", otherUserId),
				});
			}
		},
	});
};

export const useMarkRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (vars: { senderId: string; threadId?: string }) =>
			messagingService.markRead(vars.senderId, vars.threadId),
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({ queryKey: ["messaging", "inbox"] });
			if (vars.threadId) {
				queryClient.invalidateQueries({
					queryKey: messagingKeys.conversation("threads", vars.threadId),
				});
			}
			queryClient.invalidateQueries({
				queryKey: messagingKeys.conversation("users", vars.senderId),
			});
		},
	});
};

// ─── Websocket Updates integration ──────────────────────────────────────────

export const useMessagingSocket = (otherUserId?: string, threadId?: string) => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const handleNewMessage = (message: any) => {
			console.log("[socket] Received real-time message:", message);

			// Invalidate inbox list to fetch latest preview and updates
			queryClient.invalidateQueries({ queryKey: ["messaging", "inbox"] });

			// Invalidate specific thread if it matches
			if (message.threadId && threadId === message.threadId) {
				queryClient.invalidateQueries({
					queryKey: messagingKeys.conversation("threads", message.threadId),
				});
			}

			// If we are currently chatting with the sender of this message in DM
			if (
				otherUserId &&
				(message.senderId === otherUserId ||
					message.receiverId === otherUserId) &&
				(!message.threadId || threadId?.startsWith("dm-"))
			) {
				queryClient.invalidateQueries({
					queryKey: messagingKeys.conversation("users", otherUserId),
				});
			}
		};

		messagingSocket.on("new_message", handleNewMessage);

		messagingSocket.on("connect", () => {
			console.log("[socket] Connected to messaging namespace");
		});

		return () => {
			messagingSocket.off("new_message", handleNewMessage);
			messagingSocket.off("connect");
		};
	}, [otherUserId, threadId, queryClient]);
};
