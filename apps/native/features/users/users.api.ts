import type {
	CurrentUserDto,
	PublicUserDto,
	UpdateProfileDto,
} from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";

export const usersService = {
	async updateMe(data: UpdateProfileDto): Promise<CurrentUserDto> {
		const { data: response } = await api.patch<{ data: CurrentUserDto }>(
			"/users/me",
			data,
		);
		return response.data;
	},

	async getUser(id: string): Promise<PublicUserDto> {
		const { data } = await api.get<{ data: PublicUserDto }>(`/users/${id}`);
		return data.data;
	},
};
