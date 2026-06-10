import { UpdateProfileSchema } from "@free-on-the-porch/shared/schemas";
import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { Session } from "../auth/auth.decorator";
import type { UserSession } from "../auth/auth.type";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("me")
	async getMe(@Session() session: UserSession) {
		return session?.user;
	}

	@Patch("me")
	async updateMe(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(UpdateProfileSchema)) body: unknown,
	) {
		return { message: "This endpoint is currently under maintainance" };
		// return this.userService.updateProfile(session.user.id, body);
	}
}
