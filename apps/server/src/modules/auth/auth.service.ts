import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { expo } from "@better-auth/expo";
import * as schema from "@free-on-the-porch/db/schema";
import { env } from "@free-on-the-porch/env/private";
import { getErrorMessage } from "@free-on-the-porch/shared/utils";
import { BadRequestException, Injectable } from "@nestjs/common";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { toNodeHandler } from "better-auth/node";
import { eq, sql } from "drizzle-orm";
import { DrizzleService } from "../../infrastructures/database/database.service";
import { MailService } from "../../infrastructures/mail/mail.service";
import {
	getEmailVerificationTemplate,
	getResetPasswordTemplate,
	getVerificationStatusHtml,
	type VerificationCallbackOptions,
} from "../../infrastructures/mail/templates";

@Injectable()
export class AuthService {
	auth;

	constructor(
		private readonly drizzle: DrizzleService,
		private readonly mailService: MailService,
	) {
		this.auth = betterAuth({
			appName: env.PUBLIC_APP_NAME,
			database: drizzleAdapter(this.drizzle.db, {
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
					this.mailService.sendMail({
						to: user.email,
						subject: `Reset your password - ${env.PUBLIC_APP_NAME}`,
						...getResetPasswordTemplate({
							email: user.email,
							url,
						}),
					});
				},
			},
			emailVerification: {
				sendOnSignUp: true,
				sendOnSignIn: true,
				autoSignInAfterVerification: true,
				sendVerificationEmail: async ({ user: { email }, url: urlString }) => {
					// Automatically wrap verification redirect through /verify-status when verifying email.
					// /verify-status provides a ui feedback since better auth does not provide any ui feedback
					const url = new URL(urlString);
					const callbackUrl = new URL("/api/v1/auth/verify-status", urlString);
					callbackUrl.searchParams.set(
						"redirect",
						url.searchParams.get("callbackURL") || "",
					);
					url.searchParams.set("callbackURL", callbackUrl.toString());

					this.mailService.sendMail({
						to: email,
						subject: `Verify your email - ${env.PUBLIC_APP_NAME}`,
						...getEmailVerificationTemplate({ email, url: url.toString() }),
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
			hooks: {
				before: createAuthMiddleware(async (ctx) => {
					// When signing up with email and password, check if user already exist and user doesnt have a password.
					// If true, initiate accounting linking. User can then sign in using both oauth and password
					if (
						ctx.path === "/sign-up/email" ||
						ctx.path === "/send-verification-email"
					) {
						const initiated = await this.initiateLinkPasswordAccount({
							email: ctx.body?.email,
							password: ctx.body?.password,
						});

						if (initiated) {
							return ctx.json({
								user: null,
								status: true,
							});
						}
					}
				}),
			},
		});
	}

	renderVerificationCallbackHtml(options: VerificationCallbackOptions) {
		return getVerificationStatusHtml(options);
	}

	async initiateLinkPasswordAccount({
		email,
		password,
	}: {
		email: string;
		password?: string;
	}): Promise<boolean> {
		if (!email) return false;

		// Find user that has the same email but doesn't have a password account
		const user = await this.drizzle.db.query.user.findFirst({
			columns: { id: true, email: true },
			where: {
				email: email.toLowerCase(),
				NOT: { accounts: { providerId: "credential" } },
			},
			with: { accounts: { columns: { id: true } } },
		});

		// Silently skip if no user satisfies the condition
		if (!user) return false;

		const existingVerification =
			await this.drizzle.db.query.verification.findFirst({
				where: {
					identifier: { ilike: "link-password:%" },
					RAW: (t) => sql`${t.value}::jsonb ->> 'email' = lower(${email})`,
				},
			});

		// Update the expiresAt for existing verification or create a new one
		let identifier = `link-password:${crypto.randomUUID()}`;
		const context = await this.auth.$context;
		const hashedPassword = password
			? await context.password.hash(password)
			: undefined;

		if (existingVerification) {
			identifier = existingVerification.identifier;

			await this.drizzle.db
				.update(schema.verification)
				.set({
					expiresAt: new Date(Date.now() + 3600_000),
					value: JSON.stringify({
						email: user.email,
						password: hashedPassword,
					}),
				})
				.where(eq(schema.verification.id, existingVerification.id));
		} else {
			if (!password) {
				throw new BadRequestException("Password is required to create account");
			}

			await this.drizzle.db.insert(schema.verification).values({
				identifier,
				value: JSON.stringify({
					email: user.email,
					password: hashedPassword,
				}),
				expiresAt: new Date(Date.now() + 3600_000),
			});
		}

		await this.mailService.sendMail({
			to: user.email,
			subject: `Verify your email - ${env.PUBLIC_APP_NAME}`,
			...getEmailVerificationTemplate({
				email: user.email,
				url: `${env.PUBLIC_SERVER_URL}/api/v1/auth/link-password?${new URLSearchParams({ token: identifier })}`,
			}),
		});

		return true;
	}

	async linkPasswordAccount(identifier?: string, redirect?: string) {
		try {
			if (!identifier) {
				throw new BadRequestException(
					"INVALID_REQUEST: Missing user identifier in verification link.",
				);
			}

			const verification = await this.drizzle.db.query.verification.findFirst({
				where: { identifier },
			});

			if (!verification) {
				throw new BadRequestException(
					"NOT_FOUND: User verification request not found or has already been used.",
				);
			}

			if (verification.expiresAt < new Date()) {
				await this.drizzle.db
					.delete(schema.verification)
					.where(eq(schema.verification.id, verification.id));

				throw new BadRequestException(
					"TOKEN_EXPIRED: This password linking link has expired (links expire after 1 hour). Please request a new link.",
				);
			}

			const { email, password } = JSON.parse(verification.value);

			const user = await this.drizzle.db.query.user.findFirst({
				columns: { id: true, emailVerified: true },
				where: { email },
			});

			if (!user) {
				throw new BadRequestException(
					"USER_NOT_FOUND: Account matching this verification token was not found.",
				);
			}

			const context = await this.auth.$context;

			await context.internalAdapter.linkAccount({
				userId: user.id,
				accountId: user.id,
				providerId: "credential",
				password,
			});

			await Promise.all([
				this.drizzle.db
					.delete(schema.verification)
					.where(eq(schema.verification.id, verification.id)),
				user.emailVerified === false &&
					this.drizzle.db
						.update(schema.user)
						.set({ emailVerified: true })
						.where(eq(schema.user.id, user.id)),
			]);

			return this.renderVerificationCallbackHtml({ redirect });
		} catch (error) {
			if (error instanceof BadRequestException) {
				return this.renderVerificationCallbackHtml({
					type: "link-password",
					error: getErrorMessage(error),
				});
			}
			throw error;
		}
	}

	getHandler() {
		return toNodeHandler(this.auth);
	}
}
