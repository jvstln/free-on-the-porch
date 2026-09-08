import {
	publicUserSelectFields,
	user,
	userSettings,
} from "@free-on-the-porch/db";
import {
	type CurrentUserDto,
	type PaginatedResponse,
	type PublicUserDto,
	type UpdateProfileDto,
	type UpdateUserSettingsDto,
	type UserSettingsDto,
} from "@free-on-the-porch/shared/schemas";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { buildResponse } from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

@Injectable()
export class UserService {
	constructor(private readonly drizzle: DrizzleService) {}

	async getUser(id: string): Promise<PaginatedResponse<PublicUserDto>> {
		const foundUser = await this.drizzle.db.query.user.findFirst({
			where: { id },
			columns: publicUserSelectFields,
		});
		if (!foundUser) {
			throw new NotFoundException("User not found");
		}
		return buildResponse(foundUser);
	}

	async updateProfile(
		userId: string,
		data: UpdateProfileDto,
	): Promise<PaginatedResponse<CurrentUserDto>> {
		const set: Partial<typeof user.$inferInsert> = {};
		if (data.name !== undefined) set.name = data.name;
		if (data.image !== undefined) set.image = data.image;
		if (data.bio !== undefined) set.bio = data.bio;

		let updatedUser: typeof user.$inferSelect | undefined;
		if (Object.keys(set).length > 0) {
			[updatedUser] = await this.drizzle.db
				.update(user)
				.set(set)
				.where(eq(user.id, userId))
				.returning();
		} else {
			updatedUser = await this.drizzle.db.query.user.findFirst({
				where: { id: userId },
			});
		}

		if (!updatedUser) {
			throw new NotFoundException("User not found");
		}

		return buildResponse(updatedUser as CurrentUserDto);
	}

	async getSettings(
		userId: string,
	): Promise<PaginatedResponse<UserSettingsDto>> {
		let settings = await this.drizzle.db.query.userSettings.findFirst({
			where: { userId },
		});

		if (!settings) {
			const [created] = await this.drizzle.db
				.insert(userSettings)
				.values({ userId })
				.returning();
			settings = created;
		}

		if (!settings) throw new Error("Failed to load user settings");

		return buildResponse(settings as UserSettingsDto);
	}

	async updateSettings(
		userId: string,
		data: UpdateUserSettingsDto,
	): Promise<PaginatedResponse<UserSettingsDto>> {
		let settings = await this.drizzle.db.query.userSettings.findFirst({
			where: { userId },
		});

		if (!settings) {
			const [created] = await this.drizzle.db
				.insert(userSettings)
				.values({ userId, ...data })
				.returning();
			settings = created;
		} else if (Object.keys(data).length > 0) {
			const [updated] = await this.drizzle.db
				.update(userSettings)
				.set(data)
				.where(eq(userSettings.userId, userId))
				.returning();
			settings = updated;
		}

		if (!settings) throw new Error("Failed to update user settings");

		return buildResponse(settings as UserSettingsDto);
	}

	async deleteAccount(userId: string) {
		const existing = await this.drizzle.db.query.user.findFirst({
			where: { id: userId },
			columns: { id: true },
		});

		if (!existing) {
			throw new NotFoundException("User not found");
		}

		// Cascade deletes all related data (sessions, accounts, listings, etc.)
		await this.drizzle.db.delete(user).where(eq(user.id, userId));

		return buildResponse({ ok: true });
	}
}
