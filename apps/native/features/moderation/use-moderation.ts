import type {
	CreateBlockDto,
	CreateReportDto,
} from "@free-on-the-porch/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moderationService } from "./moderation.api";

export const useCreateReport = () => {
	return useMutation({
		mutationFn: (data: CreateReportDto) => moderationService.createReport(data),
	});
};

export const useBlocks = () => {
	return useQuery({
		queryKey: ["moderation", "blocks"],
		queryFn: () => moderationService.getBlocks(),
	});
};

export const useCreateBlock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateBlockDto) => moderationService.createBlock(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["moderation", "blocks"] });
			queryClient.invalidateQueries({ queryKey: ["listings", "feed"] });
		},
	});
};

export const useRemoveBlock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (blockedId: string) => moderationService.removeBlock(blockedId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["moderation", "blocks"] });
		},
	});
};
