import type { UpdateProfileDto } from "@free-on-the-porch/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../users.api";

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateProfileDto) => usersService.updateMe(data),
		onSuccess: () => {
			// Invalidate own listings in case owner info needs a refresh
			queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
		},
	});
};

export const useUserProfile = (id: string) => {
	return useQuery({
		queryKey: ["users", id],
		queryFn: () => usersService.getUser(id),
		enabled: !!id,
	});
};
