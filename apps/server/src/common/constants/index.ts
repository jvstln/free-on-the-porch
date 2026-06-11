import { env } from "@free-on-the-porch/env/server";

export const corsConfig = {
	origin: env.CORS_ORIGIN,
	credentials: true,
};
