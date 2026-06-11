import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WsException } from "@nestjs/websockets";
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
		console.log("guarding", type);

		const isPublic = this.reflector.getAllAndOverride(Public, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		if (type === "http") {
			const request = context.switchToHttp().getRequest();
			request.session = null;
			const authSession = await this.authService.auth.api.getSession();

			if (!authSession) {
				throw new UnauthorizedException();
			}

			request.session = authSession;
		}

		if (type === "ws") {
			const client = context.switchToWs().getClient();
			client.data = null;
			const authSession = await this.authService.auth.api.getSession();

			if (!authSession) {
				client.disconnect();
				throw new WsException("Unauthorized");
			}

			client.data = authSession;
		}

		return true;
	}
}
