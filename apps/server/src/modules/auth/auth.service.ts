import { expo } from "@better-auth/expo";
import { env } from "@free-on-the-porch/env/private";
import { Injectable } from "@nestjs/common";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNodeHandler } from "better-auth/node";
import { DrizzleService } from "../../infrastructures/database/database.service";
import { MailService } from "../../infrastructures/mail/mail.service";
import {
	getEmailVerificationTemplate,
	getResetPasswordTemplate,
} from "../../infrastructures/mail/templates";

@Injectable()
export class AuthService {
	readonly auth;

	constructor(
		private readonly drizzle: DrizzleService,
		private readonly mailService: MailService,
	) {
		this.auth = betterAuth({
			appName: env.PUBLIC_APP_NAME,
			database: drizzleAdapter(this.drizzle.db, {
				provider: "pg",
			}),

			trustedOrigins: env.CORS_ORIGIN,
			emailAndPassword: {
				enabled: true,
				requireEmailVerification: true,
				sendResetPassword: async ({ user, url }) => {
					const { html, text } = getResetPasswordTemplate({
						email: user.email,
						url,
					});
					this.mailService.sendMail({
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
					this.mailService.sendMail({
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
	}

	getHandler() {
		return toNodeHandler(this.auth);
	}
}
