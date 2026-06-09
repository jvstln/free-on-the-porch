import type { AuthService } from "./auth.service";

export type UserSession = NonNullable<
	Awaited<
		ReturnType<InstanceType<typeof AuthService>["auth"]["api"]["getSession"]>
	>
>;
