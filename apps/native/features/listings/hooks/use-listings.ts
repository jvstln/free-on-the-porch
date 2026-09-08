import type {
	CreateListingDto,
	NearbyListingsQueryDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { listingsService } from "../listings.api";

/**
 * Nearby listings with cursor-based infinite scroll.
 * Pages are keyed by cursor so React Query can stitch them together.
 */
export const useNearbyListings = (
	query: Omit<NearbyListingsQueryDto, "cursor">,
) => {
	return useInfiniteQuery({
		queryKey: ["listings", "nearby", query],
		queryFn: ({ pageParam }) =>
			listingsService.getNearby({ ...query, cursor: pageParam ?? undefined }),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		select: (data) => ({
			pages: data.pages,
			pageParams: data.pageParams,
			listings: data.pages.flatMap((p) => p.data),
		}),
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
	return useQuery({
		queryKey: ["myListings"],
		queryFn: () => listingsService.getMine(),
	});
};

export const useUserListings = (userId: string) => {
	return useQuery({
		queryKey: ["listings", "user", userId],
		queryFn: () => listingsService.getByUser(userId),
		enabled: !!userId,
	});
};

export const useCreateListing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			data,
			photos,
		}: {
			data: CreateListingDto;
			photos?: { uri: string }[];
		}) => listingsService.create(data, photos),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["myListings"] });
			queryClient.invalidateQueries({ queryKey: ["listings", "nearby"] });
		},
	});
};

export const useUpdateListing = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateListingDto) => listingsService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["myListings"] });
			queryClient.invalidateQueries({ queryKey: ["listings", id] });
			queryClient.invalidateQueries({ queryKey: ["listings", "nearby"] });
		},
	});
};

export const useDeleteListing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => listingsService.remove(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: ["myListings"] });
			queryClient.invalidateQueries({ queryKey: ["listings", id] });
			queryClient.invalidateQueries({ queryKey: ["listings", "nearby"] });
		},
	});
};

export const useClaimListing = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => listingsService.claim(id),
		onSuccess: () => {
			toast.success("Claim request sent!");
			queryClient.invalidateQueries({ queryKey: ["listings", id] });
			queryClient.invalidateQueries({ queryKey: ["messaging", "inbox"] });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to send claim request.");
		},
	});
};
