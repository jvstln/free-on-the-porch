import {
	applyDecorators,
	createParamDecorator,
	UseGuards,
} from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";
import type { Socket } from "socket.io";
import { corsConfig } from "../../common/constants";
import { AuthGuard } from "../../modules/auth/auth.guard";

// Param decorator exposing the authenticated session on a WebSocket handler.
// AuthGuard stores the session in `client.data` when the socket connects.
export const WsSession = createParamDecorator((_data, context) => {
	const client = context.switchToWs().getClient<Socket>();
	return client.data;
});

type AppWebSocketGatewayOptions = { namespace: string };

// Composite decorator for feature gateways. Bundles the global AuthGuard
// (which authenticates every socket on connect and joins it to `userId:<id>`)
// with a CORS-enabled Socket.IO gateway scoped to the given namespace.
// Use this instead of raw @WebSocketGateway in feature code.
export function AppWebSocketGateway({ namespace }: AppWebSocketGatewayOptions) {
	return applyDecorators(
		UseGuards(AuthGuard),
		WebSocketGateway({ cors: corsConfig, namespace }),
	);
}
