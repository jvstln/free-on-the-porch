import { db, publicUserSelectFields, user } from "@free-on-the-porch/db";
import {
	type PaginatedResponse,
	type PublicUserDto,
} from "@free-on-the-porch/shared/schemas";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { buildResponse } from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

@Injectable()
export class UserService {
	constructor(private readonly drizzle: DrizzleService) {}

	async getUser(id: string): Promise<PaginatedResponse<PublicUserDto>> {
		const test = this.drizzle.db.select({
			tsVector: sql`to_tsvector('testing')::text`,
		});

		console.log(test.from(user).toSQL());

		return { data: test } as any;

		// const foundUser = await this.drizzle.db.query.user.findFirst({
		// 	where: { id },
		// 	columns: publicUserSelectFields,
		// });
		// if (!foundUser) {
		// 	throw new NotFoundException("User not found");
		// }
		// return buildResponse(foundUser);
	}
}
