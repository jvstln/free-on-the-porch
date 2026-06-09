import { Session } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

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
