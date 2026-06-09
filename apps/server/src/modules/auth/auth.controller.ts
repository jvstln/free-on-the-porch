import { All, Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public, Session } from "./auth.decorator";
import { AuthService } from "./auth.service";
import { type UserSession } from "./auth.type";

// This controller is meant to be controlled by better-auth
@Public()
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@All("*any")
	async handleAuth(@Req() req: Request, @Res() res: Response) {
		return this.authService.getHandler()(req, res);
	}
}
