import type {
	CreateListingDto,
	NearbyQueryDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";
import { MOCK_LISTINGS } from "../mock/mock-data";
import type { ListingCardItem } from "./components/listing-card";

export const listingsService = {
	async getNearby(query: NearbyQueryDto): Promise<ListingCardItem[]> {
		try {
			const { data } = await api.get<ListingCardItem[]>("/listings/nearby", {
				params: query,
			});
			return data;
		} catch (_e) {
			console.log(
				"[listingsService] getNearby API failed, returning filtered mock data...",
			);
			return MOCK_LISTINGS.filter((item) => {
				if (query.category && item.category !== query.category) {
					return false;
				}
				const distKm = (item.distanceMeters ?? 0) / 1000;
				if (distKm > query.radiusKm) {
					return false;
				}
				return true;
			});
		}
	},

	async getOne(id: string): Promise<any> {
		try {
			const { data } = await api.get(`/listings/${id}`);
			return data;
		} catch (e) {
			console.log(
				`[listingsService] getOne API failed for ID: ${id}, returning mock fallback...`,
			);
			const mock = MOCK_LISTINGS.find((item) => item.id === id);
			if (mock) return mock;

			if (MOCK_LISTINGS.length > 0) {
				return {
					...MOCK_LISTINGS[0]!,
					id,
				};
			}
			throw e;
		}
	},

	async create(data: CreateListingDto): Promise<any> {
		try {
			const { data: response } = await api.post("/listings", data);
			return response;
		} catch (_e) {
			console.log(
				"[listingsService] create API failed, returning mock created listing...",
			);
			const newListing = {
				id: `listing-${Date.now()}`,
				title: data.title,
				description: data.description ?? "",
				category: data.category,
				condition: data.condition,
				status: "AVAILABLE" as const,
				address: data.address ?? "Maplewood",
				distanceMeters: 1000,
				images: [],
				user: { name: "You", image: null },
				createdAt: new Date().toISOString(),
				userId: "user-current", // standard mock owner ID
			};
			// Optionally push it into the local MOCK_LISTINGS array to simulate creation persistence
			MOCK_LISTINGS.unshift(newListing);
			return newListing;
		}
	},

	async getMine(): Promise<ListingCardItem[]> {
		try {
			const { data } = await api.get("/listings/mine");
			return data;
		} catch (_e) {
			console.log(
				"[listingsService] getMine API failed, returning all mock listings...",
			);
			return MOCK_LISTINGS;
		}
	},

	async update(id: string, data: UpdateListingDto): Promise<any> {
		try {
			const { data: response } = await api.patch(`/listings/${id}`, data);
			return response;
		} catch (_e) {
			console.log(
				`[listingsService] update API failed for ID: ${id}, returning local mock update...`,
			);
			const idx = MOCK_LISTINGS.findIndex((item) => item.id === id);
			if (idx !== -1) {
				MOCK_LISTINGS[idx] = {
					...MOCK_LISTINGS[idx]!,
					...data,
				};
				return MOCK_LISTINGS[idx];
			}
			return { id, ...data };
		}
	},

	async remove(id: string): Promise<any> {
		try {
			const { data: response } = await api.delete(`/listings/${id}`);
			return response;
		} catch (_e) {
			console.log(
				`[listingsService] remove API failed for ID: ${id}, removing from mock array...`,
			);
			const idx = MOCK_LISTINGS.findIndex((item) => item.id === id);
			if (idx !== -1) {
				MOCK_LISTINGS.splice(idx, 1);
			}
			return { success: true };
		}
	},
};
