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

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const type = context.getType<"http" | "ws">();

		const isPublic = this.reflector.getAllAndOverride(Public, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		if (type === "http") {
			const request = context.switchToHttp().getRequest<Request>();
			request.session = null;
			const authSession = await this.authService.auth.api.getSession({
				headers: request.headers,
			});

			if (!authSession) {
				throw new UnauthorizedException();
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
			client.join(`userId:${authSession.user.id}`);
		}

		return true;
	}
}
