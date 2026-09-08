import type { CreateCommentDto } from "@free-on-the-porch/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsService } from "./comments.api";

export const useComments = (listingId: string) => {
	return useQuery({
		queryKey: ["comments", listingId],
		queryFn: () => commentsService.findByListing(listingId),
		enabled: !!listingId,
	});
};

export const useCreateComment = (listingId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCommentDto) =>
			commentsService.create(listingId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", listingId] });
			queryClient.invalidateQueries({ queryKey: ["listings", listingId] });
		},
	});
};

export const useDeleteComment = (listingId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) =>
			commentsService.remove(listingId, commentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", listingId] });
			queryClient.invalidateQueries({ queryKey: ["listings", listingId] });
		},
	});
};
