import {
	type NotificationListQueryDto,
	NotificationListQuerySchema,
} from "@free-on-the-porch/shared/schemas";
import { Controller, Get, Param, Patch, Query, Session } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import type { UserSession } from "../auth/auth.type";
import { NotificationService } from "./notification.service";

@Controller("notifications")
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	findAll(
		@Session() session: UserSession,
		@Query(new ZodValidationPipe(NotificationListQuerySchema))
		query: NotificationListQueryDto,
	) {
		return this.notificationService.findAll(session.user.id, query);
	}

	@Patch(":id/read")
	markRead(@Param("id") id: string, @Session() session: UserSession) {
		return this.notificationService.markRead(id, session.user.id);
	}

	@Patch("read-all")
	markAllRead(@Session() session: UserSession) {
		return this.notificationService.markAllRead(session.user.id);
	}
}
