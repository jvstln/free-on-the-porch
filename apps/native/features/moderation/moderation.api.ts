import type {
	CreateBlockDto,
	CreateReportDto,
	PaginatedResponse,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export interface BlockedUser {
	id: string;
	blockerId: string;
	blockedId: string;
	createdAt: string;
	updatedAt: string;
	blocked: {
		id: string;
		name: string;
		image: string | null;
	};
}

export interface BlockRecord {
	id: string;
	blockerId: string;
	blockedId: string;
	createdAt: string;
	updatedAt: string;
}

export interface ReportRecord {
	id: string;
	reason: string;
	details: string | null;
	resolved: boolean;
	reportedById: string;
	reportedUserId: string | null;
	listingId: string | null;
	createdAt: string;
	updatedAt: string;
}

export const moderationService = {
	async getBlocks(): Promise<PaginatedResponse<BlockedUser[]>> {
		const { data } =
			await api.get<PaginatedResponse<BlockedUser[]>>("/moderation/blocks");
		return data;
	},

	async createReport(body: CreateReportDto) {
		const { data } = await api.post<{ data: ReportRecord }>(
			"/moderation/reports",
			body,
		);
		return data.data;
	},

	async createBlock(body: CreateBlockDto) {
		const { data } = await api.post<{ data: BlockRecord }>(
			"/moderation/blocks",
			body,
		);
		return data.data;
	},

	async removeBlock(blockedId: string) {
		const { data } = await api.delete<{ data: BlockRecord }>(
			`/moderation/blocks/${blockedId}`,
		);
		return data.data;
	},
};
