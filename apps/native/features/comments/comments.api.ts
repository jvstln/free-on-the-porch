import type {
	CreateCommentDto,
	ListingCommentDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export const commentsService = {
	async create(listingId: string, body: CreateCommentDto) {
		const { data } = await api.post<{ data: ListingCommentDto }>(
			`/listings/${listingId}/comments`,
			body,
		);
		return data.data;
	},

	async findByListing(listingId: string) {
		const { data } = await api.get<{ data: ListingCommentDto[] }>(
			`/listings/${listingId}/comments`,
		);
		return data.data;
	},

	async remove(listingId: string, commentId: string) {
		const { data } = await api.delete<{ data: ListingCommentDto }>(
			`/listings/${listingId}/comments/${commentId}`,
		);
		return data.data;
	},
};
