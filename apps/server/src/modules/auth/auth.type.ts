import type { AuthService } from "./auth.service";

export type UserSession = NonNullable<
	Awaited<
		ReturnType<InstanceType<typeof AuthService>["auth"]["api"]["getSession"]>
	>
>;

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
