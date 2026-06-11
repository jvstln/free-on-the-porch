import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "../../infrastructures/database/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		PrismaService,
		{ provide: APP_GUARD, useClass: AuthGuard },
	],
	exports: [AuthService],
})
export class AuthModule {}
