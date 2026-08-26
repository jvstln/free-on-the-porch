import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { expo } from "@better-auth/expo";
import * as schema from "@free-on-the-porch/db/schema";
import { env } from "@free-on-the-porch/env/private";
import { Injectable } from "@nestjs/common";
import { betterAuth } from "better-auth";
import { toNodeHandler } from "better-auth/node";
import { DrizzleService } from "../../infrastructures/database/database.service";
import { MailService } from "../../infrastructures/mail/mail.service";
import {
	getEmailVerificationTemplate,
	getResetPasswordTemplate,
} from "../../infrastructures/mail/templates";

const createBetterAuth = <
	TDatabase extends Parameters<typeof drizzleAdapter>[0],
	TMail extends MailService,
>(
	db: TDatabase,
	mailService: TMail,
) => {
	return betterAuth({
		appName: env.PUBLIC_APP_NAME,
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}) as unknown,

		trustedOrigins: env.CORS_ORIGIN,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			sendResetPassword: async ({ user, url }) => {
				const { html, text } = getResetPasswordTemplate({
					email: user.email,
					url,
				});
				mailService.sendMail({
					to: user.email,
					subject: `Reset your password - ${env.PUBLIC_APP_NAME}`,
					html,
					text,
				});
			},
		},
		emailVerification: {
			sendOnSignUp: true,
			autoSignInAfterVerification: true,
			sendVerificationEmail: async ({ user, url }) => {
				const { html, text } = getEmailVerificationTemplate({
					email: user.email,
					url,
				});
				mailService.sendMail({
					to: user.email,
					subject: `Verify your email - ${env.PUBLIC_APP_NAME}`,
					html,
					text,
				});
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		basePath: "/api/v1/auth",
		advanced: {
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
			disableCSRFCheck: env.NODE_ENV === "development",
		},
		plugins: [expo()],
	});
};

@Injectable()
export class AuthService {
	readonly auth: ReturnType<typeof createBetterAuth>;

	constructor(
		private readonly drizzle: DrizzleService,
		private readonly mailService: MailService,
	) {
		this.auth = createBetterAuth(this.drizzle.db, this.mailService);
	}

	getHandler() {
		return toNodeHandler(this.auth);
	}
}
