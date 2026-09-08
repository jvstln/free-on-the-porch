import type {
	CreateListingDto,
	ListingDetailDto,
	ListingDto,
	NearbyListingsQueryDto,
	PaginatedResponse,
	ThreadMinimalDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export const listingsService = {
	async getNearby(
		query: NearbyListingsQueryDto,
	): Promise<PaginatedResponse<ListingDto[]>> {
		const { data } = await api.get<PaginatedResponse<ListingDto[]>>(
			"/listings/nearby",
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

	async create(body: CreateListingDto, photos?: { uri: string }[]) {
		const formData = new FormData();

		for (const [key, value] of Object.entries(body)) {
			if (value !== undefined && value !== null) {
				formData.append(key, String(value));
			}
		}

		if (photos && photos.length > 0) {
			for (const photo of photos) {
				const filename = photo.uri.split("/").pop() || "photo.jpg";
				const ext = filename.split(".").pop()?.toLowerCase() || "jpeg";
				const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;

				formData.append("images", {
					uri: photo.uri,
					name: filename,
					type: mimeType,
				} as unknown as Blob);
			}
		}

		const { data } = await api.post<{ data: ListingDetailDto }>(
			"/listings",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } },
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
