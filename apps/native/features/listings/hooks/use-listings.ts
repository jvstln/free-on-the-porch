import type {
	CreateListingDto,
	NearbyQueryDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListingCardItem } from "../components/listing-card";
import { listingsService } from "../listings.api";

export const useNearbyListings = (query: NearbyQueryDto) => {
	return useQuery({
		queryKey: ["listings", "nearby", query],
		queryFn: () => listingsService.getNearby(query),
		retry: false,
	});
};

export const useListingDetail = (id: string) => {
	return useQuery({
		queryKey: ["listings", id],
		queryFn: () => listingsService.getOne(id),
		enabled: !!id,
	});
};

export const useMyListings = () => {
	return useQuery<ListingCardItem[]>({
		queryKey: ["listings", "mine"],
		queryFn: () => listingsService.getMine(),
	});
};

export const useCreateListing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateListingDto) => listingsService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["listings"] });
		},
	});
};

export const useUpdateListing = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateListingDto) => listingsService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["listings"] });
		},
	});
};

export const useDeleteListing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => listingsService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["listings"] });
		},
	});
};
