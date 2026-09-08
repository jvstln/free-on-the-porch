import type {
	CurrentUserDto,
	PaginatedResponse,
	UpdateProfileDto,
	UpdateUserSettingsDto,
	UserSettingsDto,
} from "@free-on-the-porch/shared/schemas";
import {
	UpdateProfileSchema,
	UpdateUserSettingsSchema,
} from "@free-on-the-porch/shared/schemas";
import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { Session } from "../auth/auth.decorator";
import type { UserSession } from "../auth/auth.type";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("me")
	async getMe(
		@Session() session: UserSession,
	): Promise<PaginatedResponse<CurrentUserDto | null>> {
		return { data: session?.user ?? null };
	}

	@Get("me/settings")
	async getSettings(
		@Session() session: UserSession,
	): Promise<PaginatedResponse<UserSettingsDto>> {
		return this.userService.getSettings(session.user.id);
	}

	@Get(":id")
	async getUserById(@Param("id") id: string) {
		return this.userService.getUser(id);
	}

	@Patch("me")
	async updateMe(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(UpdateProfileSchema)) body: UpdateProfileDto,
	): Promise<PaginatedResponse<CurrentUserDto>> {
		return this.userService.updateProfile(session.user.id, body);
	}

	@Patch("me/settings")
	async updateSettings(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(UpdateUserSettingsSchema))
		body: UpdateUserSettingsDto,
	): Promise<PaginatedResponse<UserSettingsDto>> {
		return this.userService.updateSettings(session.user.id, body);
	}
}
