import type { AuthService } from "./auth.service";

// The shape of an authenticated session, derived from what better-auth's
// getSession() returns. Used across controllers via the @Session() decorator.
// `session.user.id` is always the current user's id.
export type UserSession = NonNullable<
	Awaited<
		ReturnType<InstanceType<typeof AuthService>["auth"]["api"]["getSession"]>
	>
>;

// Express Request augmentation so the AuthGuard can store the session on
// `request.session` (consumed by the @Session() param decorator).
declare module "express" {
	interface Request {
		session: UserSession | null;
	}
}

// declare module "socket.io" {
// 	interface Socket {
// 		data: UserSession
// 	}
// }
