import { createEnv } from "@t3-oss/env-core";
import { publicEnvSchema } from "./public-schema";

export const env = createEnv({
	client: publicEnvSchema,
	clientPrefix: "PUBLIC_",
	runtimeEnv: {
		PUBLIC_SERVER_URL: process.env.PUBLIC_SERVER_URL,
		PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME,
		PUBLIC_EMAIL: process.env.PUBLIC_EMAIL,
		PUBLIC_SCHEME: process.env.PUBLIC_SCHEME,
		PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.PUBLIC_GOOGLE_WEB_CLIENT_ID,
		PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.PUBLIC_GOOGLE_IOS_CLIENT_ID,
		PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
			process.env.PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
	},
	emptyStringAsUndefined: true,
});
