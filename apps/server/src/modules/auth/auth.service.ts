import { expo } from "@better-auth/expo";
import { env } from "@free-on-the-porch/env/server";
import { constants } from "@free-on-the-porch/shared/constants";
import { Injectable } from "@nestjs/common";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { toNodeHandler } from "better-auth/node";
import {
	PrismaClient,
	PrismaService,
} from "../../infrastructure/database/prisma.service";

@Injectable()
export class AuthService {
	auth: ReturnType<typeof createBetterAuth>;

	constructor(private readonly prisma: PrismaService) {
		this.auth = createBetterAuth(this.prisma);
	}

	getHandler() {
		return toNodeHandler(this.auth);
	}
}

const createBetterAuth = <T extends PrismaClient>(prisma: T) => {
	return betterAuth({
		appName: constants.APP_NAME,
		database: prismaAdapter(prisma, {
			provider: "postgresql",
		}),

		trustedOrigins: env.CORS_ORIGIN,
		emailAndPassword: {
			enabled: true,
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
};
