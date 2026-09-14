import { env } from "@free-on-the-porch/env/private";
import type { Provider } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

export const cloudinaryProvider = {
	provide: "CLOUDINARY",
	useFactory: () => {
		const matchResult = env.CLOUDINARY_URL.match(
			/cloudinary:\/\/([^:]+):([^@]+)@(.+)/,
		);

		if (!matchResult) {
			throw new Error("Invalid CLOUDINARY_URL");
		}

		const [, apiKey, apiSecret, cloudName] = matchResult;

		cloudinary.config({
			// api_key: apiKey,
			// api_secret: apiSecret,
			// cloud_name: cloudName,
		});
		return cloudinary;
	},
} satisfies Provider;
