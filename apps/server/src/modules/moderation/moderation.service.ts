import { block, publicUserSelectFields, report } from "@free-on-the-porch/db";
import type {
	CreateBlockDto,
	CreateReportDto,
} from "@free-on-the-porch/shared/schemas";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { buildResponse } from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

@Injectable()
export class ModerationService {
	constructor(private readonly drizzle: DrizzleService) {}

	async getBlocks(userId: string) {
		const rows = await this.drizzle.db.query.block.findMany({
			where: { blockerId: userId },
			with: {
				blocked: {
					columns: publicUserSelectFields,
				},
			},
		});

		return buildResponse(rows);
	}

	async createReport(userId: string, dto: CreateReportDto) {
		if (dto.reportedUserId && dto.reportedUserId === userId) {
			throw new BadRequestException("You cannot report yourself");
		}

		const existing = await this.drizzle.db.query.report.findFirst({
			where: {
				reportedById: userId,
				...(dto.reportedUserId && { reportedUserId: dto.reportedUserId }),
				...(dto.listingId && { listingId: dto.listingId }),
			},
		});

		if (existing) {
			throw new ConflictException("You have already reported this");
		}

		const [row] = await this.drizzle.db
			.insert(report)
			.values({
				reason: dto.reason,
				details: dto.details,
				reportedById: userId,
				reportedUserId: dto.reportedUserId ?? null,
				listingId: dto.listingId ?? null,
			})
			.returning();

		if (!row) throw new Error("Failed to create report");

		return buildResponse(row);
	}

	async createBlock(userId: string, dto: CreateBlockDto) {
		if (dto.blockedId === userId) {
			throw new BadRequestException("You cannot block yourself");
		}

		const existing = await this.drizzle.db.query.block.findFirst({
			where: {
				blockerId: userId,
				blockedId: dto.blockedId,
			},
		});

		if (existing) {
			throw new ConflictException("Already blocked");
		}

		const [row] = await this.drizzle.db
			.insert(block)
			.values({
				blockerId: userId,
				blockedId: dto.blockedId,
			})
			.returning();

		if (!row) throw new Error("Failed to create block");

		return buildResponse(row);
	}

	async removeBlock(userId: string, blockedId: string) {
		const [deleted] = await this.drizzle.db
			.delete(block)
			.where(and(eq(block.blockerId, userId), eq(block.blockedId, blockedId)))
			.returning();

		if (!deleted) {
			throw new NotFoundException("Block not found");
		}

		return buildResponse(deleted);
	}
}
