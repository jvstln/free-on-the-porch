import { env } from "@free-on-the-porch/env/native";
import axios from "axios";

export const api = axios.create({
	baseURL: `${env.EXPO_PUBLIC_SERVER_URL}/api/v1`,
	withCredentials: true,
	headers: { "Content-Type": "application/json" },
});
