import { notification } from "@free-on-the-porch/db";
import type { NotificationListQueryOutputDto } from "@free-on-the-porch/shared/schemas";
import { Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, type SQL } from "drizzle-orm";
import {
	buildResponse,
	decodeCursor,
	type Pagination,
} from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

@Injectable()
export class NotificationService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll(userId: string, query: NotificationListQueryOutputDto) {
		const { limit, cursor, read } = query;
		const parsedCursor = decodeCursor<{ createdAt: string; id: string }>(
			cursor,
		);

		const conditions: SQL[] = [eq(notification.userId, userId)];
		if (read !== undefined) {
			conditions.push(eq(notification.read, read));
		}
		if (parsedCursor) {
			conditions.push(
				eq(notification.createdAt, new Date(parsedCursor.createdAt)),
			);
			conditions.push(eq(notification.id, parsedCursor.id));
		}

		const where = and(...(conditions as [SQL, ...SQL[]]));

		const rows = await this.drizzle.db
			.select()
			.from(notification)
			.where(where)
			.orderBy(notification.createdAt)
			.limit(limit + 1);

		const pagination: Pagination<(typeof rows)[number]> = {
			type: "cursor",
			limit,
			getCursor: (last) => ({
				createdAt: last.createdAt.toISOString(),
				id: last.id,
			}),
		};

		return buildResponse(rows, pagination);
	}

	async markRead(id: string, userId: string) {
		const existing = await this.drizzle.db.query.notification.findFirst({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException("Notification not found");
		}

		if (existing.userId !== userId) {
			throw new NotFoundException("Notification not found");
		}

		const [updated] = await this.drizzle.db
			.update(notification)
			.set({ read: true })
			.where(eq(notification.id, id))
			.returning();

		if (!updated) throw new Error("Failed to mark notification as read");

		return buildResponse(updated);
	}

	async markAllRead(userId: string) {
		await this.drizzle.db
			.update(notification)
			.set({ read: true })
			.where(
				and(eq(notification.userId, userId), eq(notification.read, false)),
			);

		return buildResponse({ ok: true });
	}
}
