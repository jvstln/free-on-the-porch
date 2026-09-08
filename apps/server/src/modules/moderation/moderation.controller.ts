import {
	type CreateBlockDto,
	CreateBlockSchema,
	type CreateReportDto,
	CreateReportSchema,
} from "@free-on-the-porch/shared/schemas";
import { Body, Controller, Delete, Param, Post, Session } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import type { UserSession } from "../auth/auth.type";
import { ModerationService } from "./moderation.service";

@Controller("moderation")
export class ModerationController {
	constructor(private readonly moderationService: ModerationService) {}

	@Post("reports")
	createReport(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateReportSchema)) body: CreateReportDto,
	) {
		return this.moderationService.createReport(session.user.id, body);
	}

	@Post("blocks")
	createBlock(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateBlockSchema)) body: CreateBlockDto,
	) {
		return this.moderationService.createBlock(session.user.id, body);
	}

	@Delete("blocks/:blockedId")
	removeBlock(
		@Session() session: UserSession,
		@Param("blockedId") blockedId: string,
	) {
		return this.moderationService.removeBlock(session.user.id, blockedId);
	}
}
