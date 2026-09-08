import type { Provider } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

export const cloudinaryProvider = {
	provide: "CLOUDINARY",
	useFactory: () => {
		cloudinary.config();
		return cloudinary;
	},
} satisfies Provider;
