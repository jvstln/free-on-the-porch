import { env } from "@free-on-the-porch/env/native";
import { io } from "socket.io-client";

// export const socket = io(env.EXPO_PUBLIC_SERVER_URL);
export const messagingSocket = io(`${env.EXPO_PUBLIC_SERVER_URL}/messaging`, {
	withCredentials: true,
});
