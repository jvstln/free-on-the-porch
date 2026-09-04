import { Session } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

// Marks a route/controller as publicly accessible, bypassing the global
// AuthGuard. Only use on endpoints that must work without a session
// (e.g. the better-auth catch-all, nearby listing feed, listing detail).
export const Public = Reflector.createDecorator<boolean>({
	transform: (value) => value ?? true,
});

/**
 * Rexeport from nestjs
 * Manual implements is:
 * @example
 * export const Session = createParamDecorator(
	(data, context: ExecutionContext) => {
		const req = context.switchToHttp().getRequest();
		return req.session as AuthSession;
	},
);
 */
export { Session };
