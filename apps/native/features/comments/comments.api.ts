import type { CreateCommentDto } from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export interface Comment {
	id: string;
	body: string;
	userId: string;
	listingId: string;
	createdAt: string;
	updatedAt: string;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
}

export const commentsService = {
	async create(listingId: string, body: CreateCommentDto) {
		const { data } = await api.post<{ data: Comment }>(
			`/listings/${listingId}/comments`,
			body,
		);
		return data.data;
	},

	async findByListing(listingId: string) {
		const { data } = await api.get<{ data: Comment[] }>(
			`/listings/${listingId}/comments`,
		);
		return data.data;
	},

	async remove(listingId: string, commentId: string) {
		const { data } = await api.delete<{ data: Comment }>(
			`/listings/${listingId}/comments/${commentId}`,
		);
		return data.data;
	},
};
