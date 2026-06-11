import {
	applyDecorators,
	createParamDecorator,
	UseGuards,
} from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";
import type { Socket } from "socket.io";
import { corsConfig } from "../../common/constants";
import { AuthGuard } from "../../modules/auth/auth.guard";

export const WsSession = createParamDecorator((_data, context) => {
	const client = context.switchToWs().getClient<Socket>();
	return client.data;
});

type AppWebSocketGatewayOptions = { namespace: string };
export function AppWebSocketGateway({ namespace }: AppWebSocketGatewayOptions) {
	return applyDecorators(
		UseGuards(AuthGuard),
		WebSocketGateway({ cors: corsConfig, namespace }),
	);
}
