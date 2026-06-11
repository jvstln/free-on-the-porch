import type { SendMessageDto } from "@free-on-the-porch/shared/schemas";
import { UseGuards } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AppWebSocketGateway } from "../../infrastructures/websocket/ws.decorator";
import { BaseWebSocketGateway } from "../../infrastructures/websocket/ws.gateway";
import { MessagingService } from "./messaging.service";

@AppWebSocketGateway({
	namespace: "messaging",
})
export class MessagingGateway extends BaseWebSocketGateway {
	@WebSocketServer()
	server!: Server;

	private readonly messagingService!: MessagingService;

	/**
	 * Client emits "send_message" → server saves + pushes to recipient's room.
	 * Falls back gracefully if recipient is offline (REST fetch on next open).
	 */
	@SubscribeMessage("send_message")
	async handleSendMessage(
		@MessageBody() payload: { senderId: string; dto: SendMessageDto },
		// @ConnectedSocket() client: Socket,
	) {
		const message = await this.messagingService.sendMessage(
			payload.senderId,
			payload.dto,
		);

		// Push to recipient's private room
		// this.server
		// 	.to(`user:${payload.dto.receiverId}`)
		// 	.emit("new_message", message);

		// Echo back to sender (confirms delivery + updates their UI)
		// client.emit("message_sent", message);

		return message;
	}
}
