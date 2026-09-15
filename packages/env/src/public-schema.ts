import { z } from "zod";

export const publicEnvSchema = {
	PUBLIC_SERVER_URL: z.url(),
	PUBLIC_APP_NAME: z.string().min(1),
	PUBLIC_EMAIL: z.email(),
	PUBLIC_SCHEME: z.string().min(1),
	PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().optional(),
	PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().optional(),
	PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
};
