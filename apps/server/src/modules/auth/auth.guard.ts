import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WsException } from "@nestjs/websockets";
import type { Request } from "express";
import type { Socket } from "socket.io";
import { Public } from "./auth.decorator";
import { AuthService } from "./auth.service";

// Global guard handling BOTH HTTP and WebSocket contexts.
// - HTTP: validates the session from request headers, sets `request.session`.
// - WS:   validates from the handshake headers, stores session in `client.data`
//         and joins the client to the `userId:<id>` room for targeted broadcasts.
// Routes/classes marked @Public() (Reflector override) bypass auth entirely.
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const type = context.getType<"http" | "ws">();

		// Honor @Public(): skip validation for explicitly public endpoints. Condition will be checked at the end of hydrating user session.
		const isPublic = this.reflector.getAllAndOverride(Public, [
			context.getHandler(),
			context.getClass(),
		]);

		if (type === "http") {
			const request = context.switchToHttp().getRequest<Request>();
			request.session = null;
			const authSession = await this.authService.auth.api.getSession({
				headers: request.headers,
			});

			if (!authSession && !isPublic) {
				throw new UnauthorizedException("Unauthorized. User not logged in");
			}

			request.session = authSession;
		}

		if (type === "ws") {
			const client = context.switchToWs().getClient<Socket>();
			const authSession = await this.authService.auth.api.getSession({
				headers: client.handshake.headers,
			});

			if (!authSession) {
				client.disconnect();
				throw new WsException("Unauthorized");
			}

			client.data = authSession;
			// Scopes the socket into a private room so gateways can target
			// individual users via `server.to('userId:<id>')`.
			client.join(`userId:${authSession.user.id}`);
		}

		return true;
	}
}
