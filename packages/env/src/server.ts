import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envSchema = {
	DATABASE_URL: z.string().min(1),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
	CORS_ORIGIN: z.preprocess(
		(val) =>
			typeof val === "string" && [
				...val.split(/,\s*/g),
				"free-on-the-pouch://",
				// Development origins
				"exp://",
				"exp://**",
				"exp://192.168.*.*:*/**",
				"http://localhost:8081",
			],
		z.array(z.string()),
	),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	CLOUDINARY_URL:z.url({protocol: /^cloudinary$/})
};

export const env = createEnv({
	server: envSchema,
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
