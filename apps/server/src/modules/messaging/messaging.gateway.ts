import type { MessageDto } from "@free-on-the-porch/shared/schemas";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { AppWebSocketGateway } from "../../infrastructures/websocket/ws.decorator";

// Realtime messaging gateway. The composite @AppWebSocketGateway decorator
// applies CORS + the global AuthGuard, which authenticates each socket on
// connect and drops it into its `userId:<id>` room.
//
// This gateway exposes no inbound events — it's used purely as a broadcast
// target from the REST controller after a message write (dual REST + WS
// delivery). See messaging.controller.ts send().
@AppWebSocketGateway({
	namespace: "messaging",
})
export class MessagingGateway {
	@WebSocketServer()
	server!: Server;

	/**
	 * Broadcast a message to all other members of the thread.
	 * Emits "new_message" to each member's userId:<id> room, skipping the
	 * sender (they already have it from the REST response).
	 */
	broadcastMessage(memberIds: string[], message: MessageDto) {
		for (const userId of memberIds) {
			if (userId !== message.senderId) {
				console.log(`[socket] Emitting new_message to user: ${userId}`);
				this.server.to(`userId:${userId}`).emit("new_message", message);
			}
		}
	}
}
