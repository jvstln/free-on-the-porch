import type { SendMessageDto } from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";
import {
	INITIAL_MESSAGES,
	INITIAL_THREADS,
	type Message,
	type Thread,
} from "../mock/mock-data";

export const messagingService = {
	async getInbox(): Promise<Thread[]> {
		try {
			const { data } = await api.get<Thread[]>("/messaging/inbox");
			return data;
		} catch (_e) {
			console.log(
				"[messagingService] getInbox API failed, returning mock inbox threads...",
			);
			return INITIAL_THREADS;
		}
	},

	async getConversation(
		otherUserId: string,
		listingId?: string,
	): Promise<Message[]> {
		try {
			const { data } = await api.get<Message[]>(`/messaging/${otherUserId}`, {
				params: { listingId },
			});
			return data;
		} catch (_e) {
			console.log(
				`[messagingService] getConversation API failed for otherUser: ${otherUserId}, returning mock thread...`,
			);
			// Find thread in mock database
			const thread = INITIAL_THREADS.find(
				(t) =>
					t.otherUser.id === otherUserId &&
					(!listingId || t.listing.id === listingId),
			);
			const threadId = thread?.id || "thread-1";
			return INITIAL_MESSAGES[threadId] || INITIAL_MESSAGES["thread-1"] || [];
		}
	},

	async sendMessage(dto: SendMessageDto): Promise<Message> {
		try {
			const { data } = await api.post<Message>("/messaging", dto);
			return data;
		} catch (_e) {
			console.log(
				"[messagingService] sendMessage API failed, performing local mock delivery...",
			);
			const newMsg: Message = {
				id: `m-user-${Date.now()}`,
				body: dto.body,
				createdAt: new Date().toLocaleTimeString(undefined, {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				}),
				isMe: true,
				read: false,
			};

			// Mutate mock data state locally to simulate server database updates
			const thread = INITIAL_THREADS.find(
				(t) =>
					t.otherUser.id === dto.receiverId &&
					(!dto.listingId || t.listing.id === dto.listingId),
			);
			const threadId = thread?.id || "thread-1";

			if (!INITIAL_MESSAGES[threadId]) {
				INITIAL_MESSAGES[threadId] = [];
			}
			INITIAL_MESSAGES[threadId].push(newMsg);

			// Also update last message of the thread list item
			if (thread) {
				thread.lastMessage = {
					body: dto.body,
					createdAt: "Just now",
					read: true,
					isMe: true,
				};
			}

			return newMsg;
		}
	},

	async markRead(senderId: string): Promise<{ success: boolean }> {
		try {
			const { data } = await api.post(`/messaging/${senderId}/read`);
			return data;
		} catch (_e) {
			console.log(
				`[messagingService] markRead API failed for sender: ${senderId}, updating mock read states...`,
			);
			const thread = INITIAL_THREADS.find((t) => t.otherUser.id === senderId);
			if (thread) {
				thread.unreadCount = 0;
				thread.lastMessage.read = true;
			}
			return { success: true };
		}
	},
};
