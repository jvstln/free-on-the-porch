import { comment, publicUserSelectFields } from "@free-on-the-porch/db";
import type { CreateCommentDto } from "@free-on-the-porch/shared/schemas";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { buildResponse } from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

@Injectable()
export class CommentService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(listingId: string, userId: string, dto: CreateCommentDto) {
		const foundListing = await this.drizzle.db.query.listing.findFirst({
			where: { id: listingId },
			columns: { id: true },
		});

		if (!foundListing) {
			throw new NotFoundException("Listing not found");
		}

		const [row] = await this.drizzle.db
			.insert(comment)
			.values({
				body: dto.body,
				userId,
				listingId,
			})
			.returning();

		if (!row) throw new Error("Failed to create comment");

		const author = await this.drizzle.db.query.user.findFirst({
			where: { id: userId },
			columns: publicUserSelectFields,
		});

		return buildResponse({ ...row, user: author });
	}

	async findByListing(listingId: string) {
		const foundListing = await this.drizzle.db.query.listing.findFirst({
			where: { id: listingId },
			columns: { id: true },
		});

		if (!foundListing) {
			throw new NotFoundException("Listing not found");
		}

		const rows = await this.drizzle.db.query.comment.findMany({
			where: { listingId },
			orderBy: (c, { desc: d }) => [d(c.createdAt)],
			with: {
				user: {
					columns: publicUserSelectFields,
				},
			},
		});

		return buildResponse(rows);
	}

	async remove(id: string, userId: string) {
		const existing = await this.drizzle.db.query.comment.findFirst({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException("Comment not found");
		}

		if (existing.userId !== userId) {
			throw new BadRequestException("You can only delete your own comments");
		}

		const [deleted] = await this.drizzle.db
			.delete(comment)
			.where(eq(comment.id, id))
			.returning();

		if (!deleted) throw new Error("Failed to delete comment");

		return buildResponse(deleted);
	}
}
