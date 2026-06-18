import type { UpdateProfileDto } from "@free-on-the-porch/shared/schemas";
import { api } from "@/lib/api";
import { MOCK_USER } from "../mock/mock-data";

export const usersService = {
	async updateMe(data: UpdateProfileDto): Promise<any> {
		try {
			const { data: response } = await api.patch("/users/me", data);
			return response;
		} catch (_e) {
			console.log(
				"[usersService] updateMe API failed/offline, mutating local MOCK_USER...",
			);
			if (data.name !== undefined) MOCK_USER.name = data.name;
			if (data.bio !== undefined) MOCK_USER.bio = data.bio ?? "";
			if (data.image !== undefined) MOCK_USER.image = data.image;
			return MOCK_USER;
		}
	},

	async getUser(id: string): Promise<any> {
		try {
			const { data: response } = await api.get(`/users/${id}`);
			return response;
		} catch (_e) {
			console.log(
				`[usersService] getUser API failed/offline for ID: ${id}, searching mock databases...`,
			);

			// Map different forms of Sarah's user id (from listing, threads, sessions)
			if (
				id === MOCK_USER.id ||
				id === "current" ||
				id === "user-sarah" ||
				id === "Sarah Jenkins"
			) {
				return MOCK_USER;
			}

			const mockProfiles: Record<
				string,
				{ name: string; image: string | null; bio: string; createdAt: string }
			> = {
				"user-sarah": {
					name: "Sarah Jenkins",
					image:
						"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
					bio: "Sustainability advocate & wood crafting enthusiast. Decluttering one item at a time! 🌿",
					createdAt: "2026-03-12T14:32:00.000Z",
				},
				"Sarah Jenkins": {
					name: "Sarah Jenkins",
					image:
						"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
					bio: "Sustainability advocate & wood crafting enthusiast. Decluttering one item at a time! 🌿",
					createdAt: "2026-03-12T14:32:00.000Z",
				},
				"user-dave": {
					name: "Dave Miller",
					image:
						"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
					bio: "Avid DIYer and gardener. Always happy to share spare tools and materials.",
					createdAt: "2026-01-20T09:15:00.000Z",
				},
				"Dave Miller": {
					name: "Dave Miller",
					image:
						"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
					bio: "Avid DIYer and gardener. Always happy to share spare tools and materials.",
					createdAt: "2026-01-20T09:15:00.000Z",
				},
				"user-emma": {
					name: "Emma Watson",
					image:
						"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
					bio: "Mother of two. Repurposing baby items to help other parents around Maplewood.",
					createdAt: "2026-02-14T11:45:00.000Z",
				},
				"Emma Watson": {
					name: "Emma Watson",
					image:
						"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
					bio: "Mother of two. Repurposing baby items to help other parents around Maplewood.",
					createdAt: "2026-02-14T11:45:00.000Z",
				},
				"user-marcus": {
					name: "Marcus Chen",
					image:
						"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
					bio: "Urban homesteader. Sharing organic seeds, starters, and compost.",
					createdAt: "2026-04-01T16:20:00.000Z",
				},
				"Marcus Chen": {
					name: "Marcus Chen",
					image:
						"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
					bio: "Urban homesteader. Sharing organic seeds, starters, and compost.",
					createdAt: "2026-04-01T16:20:00.000Z",
				},
			};

			const profile = mockProfiles[id];
			if (profile) {
				return { id, ...profile };
			}

			// Clean up dynamic IDs or user names passed from routes
			const readableName = id
				.replace(/-/g, " ")
				.replace(/\b\w/g, (c) => c.toUpperCase());
			const profileByName = mockProfiles[readableName];
			if (profileByName) {
				return { id, ...profileByName };
			}

			return {
				id,
				name: readableName || "Neighbor",
				image: null,
				bio: "A friendly neighbor on the Porch.",
				createdAt: new Date().toISOString(),
			};
		}
	},
};
