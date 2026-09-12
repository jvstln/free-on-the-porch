import { All, Controller, Get, Header, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "./auth.decorator";
import { AuthService } from "./auth.service";

// Catch-all controller: better-auth fully owns every route under
// `/api/v1/auth/*` (sign-in, registration, verification, password reset, etc.).
// Specific endpoints like `/verify-status` are declared first to serve
// our custom desktop & mobile callback page.
// Must be @Public() or the global AuthGuard would reject its own endpoints.
@Public()
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("verify-status")
	@Header("Content-Type", "text/html; charset=utf-8")
	async verifyStatus(
		@Query("error") error: string | undefined,
		@Query("redirect") redirect: string | undefined,
	) {
		return this.authService.renderVerificationCallbackHtml({
			error,
			redirect,
		});
	}

	@All("*")
	async handleAuth(@Req() req: Request, @Res() res: Response) {
		return this.authService.getHandler()(req, res);
	}
}
