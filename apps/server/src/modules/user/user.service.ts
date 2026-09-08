import { publicUserSelectFields, user } from "@free-on-the-porch/db";
import {
	type CurrentUserDto,
	type PaginatedResponse,
	type PublicUserDto,
	type UpdateProfileDto,
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
}
