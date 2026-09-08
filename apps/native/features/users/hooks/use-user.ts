import type {
	UpdateProfileDto,
	UpdateUserSettingsDto,
} from "@free-on-the-porch/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../users.api";

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateProfileDto) => usersService.updateMe(data),
		onSuccess: () => {
			// Invalidate own listings in case owner info needs a refresh
			queryClient.invalidateQueries({ queryKey: ["myListings"] });
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

export const useSettings = () => {
	return useQuery({
		queryKey: ["settings"],
		queryFn: () => usersService.getSettings(),
	});
};

export const useUpdateSettings = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateUserSettingsDto) =>
			usersService.updateSettings(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] });
		},
	});
};
