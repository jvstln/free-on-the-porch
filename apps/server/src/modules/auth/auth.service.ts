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
	getVerificationStatusHtml,
} from "../../infrastructures/mail/templates";

// Factory building the better-auth instance. It's kept as a plain function
// (instead of inline in the constructor) to keep the DI/types simple.
//
// Key config:
// - drizzleAdapter: persists better-auth tables (user/session/account/
//   verification) into the shared Drizzle schema.
// - expo(): better-auth plugin tuned for Expo/mobile clients (secure store
//   cookies, deep-link redirect handling).
// - emailAndPassword + emailVerification: email/password auth with required
//   verification and custom email templates sent via MailService.
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

		trustedOrigins: [
			...env.CORS_ORIGIN,
			env.PUBLIC_SERVER_URL,
			`${env.PUBLIC_SCHEME}://`,
		],
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
				let verificationUrl = url;
				try {
					const parsedUrl = new URL(url);
					const callbackParam = parsedUrl.searchParams.get("callbackURL");
					const statusBaseUrl = `${env.PUBLIC_SERVER_URL}/api/v1/auth/verify-status`;

					// If callbackURL doesn't already point to our web status UI, redirect to verify-status
					if (!callbackParam?.startsWith(statusBaseUrl)) {
						const redirectTarget =
							callbackParam || `${env.PUBLIC_SCHEME}://dashboard`;
						const newCallback = new URL(statusBaseUrl);
						newCallback.searchParams.set("redirect", redirectTarget);
						parsedUrl.searchParams.set("callbackURL", newCallback.toString());
						verificationUrl = parsedUrl.toString();
					}
				} catch {
					// Fallback to original url if parsing fails
				}

				const { html, text } = getEmailVerificationTemplate({
					email: user.email,
					url: verificationUrl,
				});
				mailService.sendMail({
					to: user.email,
					subject: `Verify your email - ${env.PUBLIC_APP_NAME}`,
					html,
					text,
				});
			},
		},
		socialProviders: {
			google: {
				clientId: [
					env.PUBLIC_GOOGLE_WEB_CLIENT_ID,
					env.PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
					env.PUBLIC_GOOGLE_IOS_CLIENT_ID,
				].filter((value): value is string => Boolean(value)),
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: `${env.PUBLIC_SERVER_URL}`,
		basePath: "/api/v1/auth",
		advanced: {
			defaultCookieAttributes: {
				sameSite: env.NODE_ENV === "development" ? "lax" : "none",
				secure: env.NODE_ENV !== "development",
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

	renderVerificationCallbackHtml(options: {
		error?: string;
		redirect?: string;
	}) {
		return getVerificationStatusHtml(options);
	}

	getHandler() {
		return toNodeHandler(this.auth);
	}
}
