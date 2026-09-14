import type {
	CreateListingDto,
	FeedListingsQueryDto,
	ListingDetailDto,
	ListingDto,
	PaginatedResponse,
	ThreadMinimalDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export const listingsService = {
	async getFeed(
		query: FeedListingsQueryDto,
	): Promise<PaginatedResponse<ListingDto[]>> {
		const { data } = await api.get<PaginatedResponse<ListingDto[]>>(
			"/listings/feed",
			{ params: query },
		);

		return data;
	},

	async getOne(id: string): Promise<ListingDetailDto> {
		const { data } = await api.get<{ data: ListingDetailDto }>(
			`/listings/${id}`,
		);
		return data.data;
	},

	async create(body: CreateListingDto): Promise<ListingDetailDto> {
		const { data } = await api.post<{ data: ListingDetailDto }>(
			"/listings",
			body,
		);
		return data.data;
	},

	async getMine(): Promise<ListingDto[]> {
		const { data } = await api.get<{ data: ListingDto[] }>("/listings/mine");
		return data.data;
	},

	async getByUser(userId: string): Promise<ListingDto[]> {
		const { data } = await api.get<{ data: ListingDto[] }>(
			`/listings/user/${userId}`,
		);
		return data.data;
	},

	async update(id: string, body: UpdateListingDto) {
		const { data } = await api.patch<{ data: ListingDto }>(
			`/listings/${id}`,
			body,
		);
		return data.data;
	},

	async remove(id: string): Promise<{ success: boolean }> {
		const { data } = await api.delete<{ data: { success: boolean } }>(
			`/listings/${id}`,
		);
		return data.data;
	},

	async claim(id: string): Promise<ThreadMinimalDto> {
		const { data } = await api.post<PaginatedResponse<ThreadMinimalDto>>(
			`/listings/${id}/claim`,
		);
		return data.data;
	},
};
