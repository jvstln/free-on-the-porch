import { env } from "@free-on-the-porch/env/public";
import { getErrorMessage } from "@free-on-the-porch/shared/utils";
import axios from "axios";
import { useGlobalStore } from "@/store/global.store";
import { authClient } from "./auth-client";

export const api = axios.create({
	baseURL: `${env.PUBLIC_SERVER_URL}/api/v1`,
	withCredentials: true,
	headers: { "Content-Type": "application/json" },
});

// Attach auth cookie to requests on native platforms where cookies aren't automatically sent
api.interceptors.request.use(
	(config) => {
		const cookie = authClient.getCookie();
		if (cookie) {
			config.headers.Cookie = cookie;
			config.withCredentials = false; // Credentials can interfere with the cookies that are set manually in the headers
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Format error message properly
api.interceptors.response.use(
	(response) => response,
	(error) => {
		Object.assign(error, {
			originalMessage: error.message,
			message: getErrorMessage(error),
		});

		return Promise.reject(error);
	},
);

// Open auth sheet if user is not logged in
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (
			error.response?.status === 401 &&
			getErrorMessage(error)
				.toLowerCase()
				.replace(/\s+/, " ")
				.includes("user not logged in")
		) {
			useGlobalStore.getState().setAuthSheetView("login");
			throw new Error("You need to login first");
		}

		return Promise.reject(error);
	},
);
