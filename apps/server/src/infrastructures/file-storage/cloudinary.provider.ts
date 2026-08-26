import type { Provider } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

export const cloudinaryProvider = {
	provide: "CLOUDINARY",
	useFactory: () => {
		const _c = cloudinary.config({
			// cloud_name: env.CLOUDINARY_CLOUD_NAME,
			// api_key: env.CLOUDINARY_API_KEY,
			// api_secret: env.CLOUDINARY_API_SECRET,
			// secure: true,
		});

		return cloudinary;
	},
} satisfies Provider;
