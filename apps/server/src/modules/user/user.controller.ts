import type { CurrentUserDto } from "@free-on-the-porch/shared/schemas";
import { UpdateProfileSchema } from "@free-on-the-porch/shared/schemas";
import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { Session } from "../auth/auth.decorator";
import type { UserSession } from "../auth/auth.type";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("me")
	async getMe(@Session() session: UserSession): Promise<CurrentUserDto | null> {
		return session?.user;
	}

	@Get(":id")
	async getUserById(@Param("id") id: string) {
		return this.userService.getUser(id);
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
