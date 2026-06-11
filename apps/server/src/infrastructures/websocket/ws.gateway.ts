import type {
	OnGatewayConnection,
	OnGatewayDisconnect,
} from "@nestjs/websockets";
import type { Socket } from "socket.io";

export class BaseWebSocketGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	static connectedUsers: Map<string, Socket[]> = new Map();

	handleConnection(client: Socket) {
		const connectedUserSockets = BaseWebSocketGateway.connectedUsers.get(
			client.data.user.id,
		);

		if (connectedUserSockets) {
			connectedUserSockets.push(client);
		} else {
			BaseWebSocketGateway.connectedUsers.set(client.data.user.id, [client]);
		}
	}

	handleDisconnect(client: Socket) {
		const connectedUserSockets = BaseWebSocketGateway.connectedUsers.get(
			client.data.user.id,
		);

		if (!connectedUserSockets) return;

		BaseWebSocketGateway.connectedUsers.set(
			client.data.user.id,
			connectedUserSockets.filter(
				(connectedClient) => connectedClient !== client,
			),
		);
	}
}
