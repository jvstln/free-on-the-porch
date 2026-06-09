import { UpdateProfileSchema } from "@free-on-the-porch/shared/schemas";
import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { Session } from "../auth/auth.decorator";
import type { UserSession } from "../auth/auth.type";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("me")
	@ApiOperation({ summary: "Get current authenticated user" })
	async getMe(@Session() session: UserSession) {
		return session?.user;
	}

	@Patch("me")
	@ApiOperation({ summary: "Update current user profile" })
	async updateMe(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(UpdateProfileSchema)) body: unknown,
	) {
		return { message: "This endpoint is currently under maintainance" };
		// return this.userService.updateProfile(session.user.id, body);
	}
}
