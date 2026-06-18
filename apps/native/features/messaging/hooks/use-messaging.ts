import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { messagingSocket } from "@/lib/socket-client";
import { messagingService } from "../messaging.api";

// Query keys
export const messagingKeys = {
	inbox: ["messaging", "inbox"] as const,
	thread: (otherUserId: string) =>
		["messaging", "thread", otherUserId] as const,
};

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

export const useInboxThreads = () => {
	return useQuery({
		queryKey: messagingKeys.inbox,
		queryFn: () => messagingService.getInbox(),
	});
};

export const useThreadMessages = (otherUserId: string, listingId?: string) => {
	return useQuery({
		queryKey: messagingKeys.thread(otherUserId),
		queryFn: () => messagingService.getConversation(otherUserId, listingId),
		enabled: !!otherUserId,
	});
};

export const useSendMessage = (otherUserId: string, listingId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: string) =>
			messagingService.sendMessage({
				receiverId: otherUserId,
				listingId,
				body,
			}),
		onSuccess: (_newMessage) => {
			// Invalidate inbox and current thread to refresh UI
			queryClient.invalidateQueries({ queryKey: messagingKeys.inbox });
			queryClient.invalidateQueries({
				queryKey: messagingKeys.thread(otherUserId),
			});
		},
	});
};

export const useMarkRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (senderId: string) => messagingService.markRead(senderId),
		onSuccess: (_, _senderId) => {
			queryClient.invalidateQueries({ queryKey: messagingKeys.inbox });
		},
	});
};

// ─── Websocket Updates integration ──────────────────────────────────────────

export const useMessagingSocket = (otherUserId?: string) => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const handleNewMessage = (message: any) => {
			console.log("[socket] Received real-time message:", message);

			// Invalidate inbox list to fetch latest preview and updates
			queryClient.invalidateQueries({ queryKey: messagingKeys.inbox });

			// If we are currently chatting with the sender of this message, merge it into active conversation cache
			if (
				otherUserId &&
				(message.senderId === otherUserId || message.receiverId === otherUserId)
			) {
				queryClient.setQueryData<any[]>(
					messagingKeys.thread(otherUserId),
					(old = []) => {
						// Avoid duplicate additions
						if (old.some((m) => m.id === message.id)) return old;

						// Map database message format to client-side model if necessary
						const clientMessage = {
							id: message.id,
							body: message.body,
							createdAt: new Date(message.createdAt).toLocaleTimeString(
								undefined,
								{
									hour: "2-digit",
									minute: "2-digit",
									hour12: true,
								},
							),
							isMe: message.senderId !== otherUserId, // if sender matches otherUserId, isMe is false
							read: message.read,
						};

						return [...old, clientMessage];
					},
				);
			}
		};

		messagingSocket.on("new_message", handleNewMessage);

		// If connected, join our private rooms/namespaces if necessary
		messagingSocket.on("connect", () => {
			console.log("[socket] Connected to messaging namespace");
		});

		return () => {
			messagingSocket.off("new_message", handleNewMessage);
			messagingSocket.off("connect");
		};
	}, [otherUserId, queryClient]);
};
