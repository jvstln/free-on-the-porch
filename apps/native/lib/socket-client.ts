import { env } from "@free-on-the-porch/env/public";
import { io, type Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getMessagingSocket(): Socket {
	if (!_socket) {
		_socket = io(`${env.PUBLIC_SERVER_URL}/messaging`, {
			withCredentials: true,
			autoConnect: false,
		});
	}
	return _socket;
}

export function connectMessagingSocket() {
	const socket = getMessagingSocket();
	if (!socket.connected) {
		socket.connect();
	}
	return socket;
}

export function disconnectMessagingSocket() {
	if (_socket) {
		_socket.disconnect();
		_socket = null;
	}
}
