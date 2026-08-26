import type { SendMessageDto } from "@free-on-the-porch/shared/schemas";
import {
	MessageBody,
	SubscribeMessage,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { AppWebSocketGateway } from "../../infrastructures/websocket/ws.decorator";

@AppWebSocketGateway({
	namespace: "messaging",
})
export class MessagingGateway {
	@WebSocketServer()
	server!: Server;

	/**
	 * Broadcast a message to all other members of the thread.
	 */
	broadcastMessage(memberIds: string[], message: any) {
		for (const userId of memberIds) {
			if (userId !== message.senderId) {
				console.log(`[socket] Emitting new_message to user: ${userId}`);
				this.server.to(`userId:${userId}`).emit("new_message", message);
			}
		}
	}
}
