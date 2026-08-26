import type { Socket } from "socket.io";
import type { UserSession } from "../../modules/auth/auth.type";

export type AuthenticatedSocket = Socket & { data: UserSession };
