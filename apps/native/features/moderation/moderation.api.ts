import type {
	CreateBlockDto,
	CreateReportDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export const moderationService = {
	async createReport(body: CreateReportDto) {
		const { data } = await api.post<{ data: unknown }>(
			"/moderation/reports",
			body,
		);
		return data.data;
	},

	async createBlock(body: CreateBlockDto) {
		const { data } = await api.post<{ data: unknown }>(
			"/moderation/blocks",
			body,
		);
		return data.data;
	},

	async removeBlock(blockedId: string) {
		const { data } = await api.delete<{ data: unknown }>(
			`/moderation/blocks/${blockedId}`,
		);
		return data.data;
	},
};
