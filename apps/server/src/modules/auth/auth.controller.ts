import { All, Controller, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "./auth.decorator";
import { AuthService } from "./auth.service";

// Catch-all controller: better-auth fully owns every route under
// `/api/v1/auth/*` (sign-in, registration, verification, password reset, etc.).
// We simply delegate the raw request/response to better-auth's node handler.
// Must be @Public() or the global AuthGuard would reject its own endpoints.
@Public()
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@All("*any")
	async handleAuth(@Req() req: Request, @Res() res: Response) {
		return this.authService.getHandler()(req, res);
	}
}
