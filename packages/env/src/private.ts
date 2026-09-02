import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../");

dotenv.config({ path: path.join(rootDir, ".env") });

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { publicEnvSchema } from "./public-schema";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		PORT: z.coerce.number().default(3000),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.preprocess(
			(val) =>
				typeof val === "string"
					? [
							...val.split(/,\s*/g),
							"free-on-the-pouch://",
							// Development origins
							"exp://",
							"exp://**",
							"exp://192.168.*.*:*/**",
							"http://localhost:8081",
						]
					: val,
			z.array(z.string()),
		),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		CLOUDINARY_URL: z.url({ protocol: /^cloudinary$/ }),
		MAILJET_API_KEY: z.string().optional(),
		MAILJET_SECRET: z.string().optional(),
		MAIL_PROVIDER: z.enum(["mailjet", "console"]).default("console"),

		...publicEnvSchema,
	},
	runtimeEnv: {
		...process.env,
		SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL ?? process.env.SERVER_URL,
		APP_NAME: process.env.EXPO_PUBLIC_APP_NAME ?? process.env.APP_NAME,
		EMAIL: process.env.EXPO_PUBLIC_EMAIL ?? process.env.EMAIL,
		SCHEME: process.env.EXPO_PUBLIC_SCHEME ?? process.env.SCHEME,
	},
	emptyStringAsUndefined: true,
});
