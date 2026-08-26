import { env } from "@free-on-the-porch/env/private";

export const corsConfig = {
	origin: env.CORS_ORIGIN,
	credentials: true,
};
