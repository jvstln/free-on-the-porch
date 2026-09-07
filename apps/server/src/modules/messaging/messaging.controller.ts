import {
	type ConversationQueryOutputDto,
	ConversationQuerySchema,
	type SendMessageDto,
	SendMessageSchema,
	type ThreadsQueryOutputDto,
	ThreadsQuerySchema,
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
		private readonly messagingGateway: MessagingGateway,
	) {}

	// Send a message. After the service writes to the DB, we broadcast the new
	// message to the other thread members over the WebSocket gateway (dual
	// REST + WS delivery). The sender already gets the message from the REST
	// response, so the broadcast skips them.
	@Post()
	async send(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(SendMessageSchema)) body: SendMessageDto,
	) {
		const { message, memberIds } = await this.messagingService.sendMessage(
			session.user.id,
			body,
		);

		this.messagingGateway.broadcastMessage(memberIds, message);

		return message;
	}

	@Get("threads")
	getThreads(
		@Session() session: UserSession,
		@Query(new ZodValidationPipe(ThreadsQuerySchema))
		query: ThreadsQueryOutputDto,
	) {
		return this.messagingService.getThreads(session.user.id, query);
	}

	// Conversation lookup. The schema is split: path params (type, id) validate
	// via `.pick()`, query params (pagination) via `.omit()`. See messaging
	// service getConversation for the type semantics.
	@Get("conversations/:type/:id")
	getConversations(
		@Session() session: UserSession,
		@Param(
			new ZodValidationPipe(
				ConversationQuerySchema.pick({ type: true, id: true }),
			),
		)
		params: Pick<ConversationQueryOutputDto, "type" | "id">,
		@Query(
			new ZodValidationPipe(
				ConversationQuerySchema.omit({ type: true, id: true }),
			),
		)
		query: Omit<ConversationQueryOutputDto, "type" | "id">,
	) {
		return this.messagingService.getConversation(session.user.id, {
			...params,
			...query,
		});
	}

	@Post(":userId/read")
	markRead(
		@Session() session: UserSession,
		@Param("userId") senderId: string,
		@Query("threadId") threadId: string,
	) {
		return this.messagingService.markRead(session.user.id, senderId, threadId);
	}
}
