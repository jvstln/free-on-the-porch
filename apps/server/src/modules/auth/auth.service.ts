import { expo } from "@better-auth/expo";
import { env } from "@free-on-the-porch/env/server";
import { constants } from "@free-on-the-porch/shared/constants";
import { Injectable } from "@nestjs/common";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNodeHandler } from "better-auth/node";
import type { DrizzleService } from "../../infrastructures/database/database.service";
import { MailService } from "../../infrastructures/mail/mail.service";
import {
	getEmailVerificationTemplate,
	getResetPasswordTemplate,
} from "../../infrastructures/mail/templates";

@Injectable()
export class AuthService {
	private readonly drizzle!: DrizzleService;
	private readonly mailService!: MailService;

	readonly auth = betterAuth({
		appName: constants.APP_NAME,
		database: drizzleAdapter(this.drizzle.db, {
			provider: "pg",
		}),

		trustedOrigins: env.CORS_ORIGIN,
		emailAndPassword: {
			enabled: true,
			sendResetPassword: async ({ user, url }) => {
				const { html, text } = getResetPasswordTemplate({
					email: user.email,
					url,
				});
				await this.mailService.sendMail({
					to: user.email,
					subject: `Reset your password - ${constants.APP_NAME}`,
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
				await this.mailService.sendMail({
					to: user.email,
					subject: `Verify your email - ${constants.APP_NAME}`,
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
		},
		plugins: [expo()],
	});

	getHandler() {
		return toNodeHandler(this.auth);
	}
}
