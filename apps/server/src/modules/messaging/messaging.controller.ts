import {
	type SendMessageDto,
	SendMessageSchema,
} from "@free-on-the-porch/shared/schemas";
import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Session,
} from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { type UserSession } from "../auth/auth.type";
import { MessagingGateway } from "./messaging.gateway";
import { MessagingService } from "./messaging.service";

@Controller("messaging")
export class MessagingController {
	constructor(
		private readonly messagingService: MessagingService,
		// private readonly messagingGateway: MessagingGateway,
	) {}

	@Post()
	async send(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(SendMessageSchema)) body: SendMessageDto,
	) {
		const message = await this.messagingService.sendMessage(
			session.user.id,
			body,
		);

		// If recipient is connected via socket, push immediately
		// this.messagingGateway.pushMessage(body.receiverId, message);

		return message;
	}

	@Get("inbox")
	getInbox(@Session() session: UserSession) {
		return this.messagingService.getInbox(session.user.id);
	}

	@Get(":userId")
	getConversation(
		@Session() session: UserSession,
		@Param("userId") otherUserId: string,
		@Query("listingId") listingId?: string,
		@Query("cursor") cursor?: string,
		@Query("limit") limit?: string,
	) {
		return this.messagingService.getConversation(
			session.user.id,
			otherUserId,
			listingId,
			cursor,
			limit ? Number.parseInt(limit, 10) : 30,
		);
	}

	@Post(":userId/read")
	markRead(@Session() session: UserSession, @Param("userId") senderId: string) {
		return this.messagingService.markRead(session.user.id, senderId);
	}
}
