import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Public } from "./auth.decorator";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		request.session = null;

		const isPublic = this.reflector.getAllAndOverride(Public, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		const authSession = await this.authService.auth.api.getSession();

		if (!authSession) {
			throw new UnauthorizedException();
		}

		request.session = authSession;

		return true;
	}
}
