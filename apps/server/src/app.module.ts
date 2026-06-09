import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./infrastructure/database/prisma.module";
import { FileStorageModule } from "./infrastructure/file-storage/file-storage.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ListingModule } from "./modules/listing/listing.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		AuthModule,
		PrismaModule,
		ConfigModule.forRoot(),
		UserModule,
		ListingModule,
		FileStorageModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
