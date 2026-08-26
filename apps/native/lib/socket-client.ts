import { env } from "@free-on-the-porch/env/public";
import { io } from "socket.io-client";

// export const socket = io(env.PUBLIC_SERVER_URL);
export const messagingSocket = io(`${env.PUBLIC_SERVER_URL}/messaging`, {
	withCredentials: true,
});
