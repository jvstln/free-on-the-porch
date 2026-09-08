import type {
	ConversationDto,
	ConversationQueryDto,
	MessageDto,
	PaginatedResponse,
	SendMessageDto,
	ThreadDto,
	ThreadsQueryDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export const messagingService = {
	async getInbox(
		query?: ThreadsQueryDto,
	): Promise<PaginatedResponse<ThreadDto[]>> {
		const { data } = await api.get<PaginatedResponse<ThreadDto[]>>(
			"/messaging/threads",
			{
				params: query,
			},
		);
		return data;
	},

	async getConversation(
		query: ConversationQueryDto,
	): Promise<PaginatedResponse<ConversationDto>> {
		const { type, id, ...params } = query;
		const { data } = await api.get<PaginatedResponse<ConversationDto>>(
			`/messaging/conversations/${type}/${id}`,
			{
				params,
			},
		);
		return data;
	},

	async sendMessage(dto: SendMessageDto): Promise<MessageDto> {
		const { data } = await api.post<{ data: MessageDto }>("/messaging", dto);
		return data.data;
	},

	async markRead(
		senderId: string,
		threadId?: string,
	): Promise<{ success: boolean }> {
		const { data } = await api.post<{ data: { success: boolean } }>(
			`/messaging/${senderId}/read`,
			null,
			{ params: { threadId } },
		);
		return data.data;
	},
};
