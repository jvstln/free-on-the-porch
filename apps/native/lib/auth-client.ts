import { expoClient } from "@better-auth/expo/client";
import { env } from "@free-on-the-porch/env/public";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: env.PUBLIC_SERVER_URL,
	basePath: "/api/v1/auth",
	plugins: [
		expoClient({
			scheme: env.PUBLIC_SCHEME,
			storagePrefix: env.PUBLIC_SCHEME,
			storage: SecureStore,
		}),
	],
});
