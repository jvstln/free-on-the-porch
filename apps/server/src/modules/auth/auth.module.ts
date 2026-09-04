import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

// AuthModule wires up better-auth and, critically, registers the AuthGuard as
// a GLOBAL guard (APP_GUARD). This means every route — and every WebSocket
// gateway using @AppWebSocketGateway — is authenticated by default; endpoints
// opt out with the @Public() decorator.
@Module({
	controllers: [AuthController],
	providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
	exports: [AuthService],
})
export class AuthModule {}
