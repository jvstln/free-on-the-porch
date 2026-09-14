import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./infrastructures/database/database.module";
import { LoggerModule } from "./infrastructures/logger/logger.module";
import { MailModule } from "./infrastructures/mail/mail.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommentModule } from "./modules/comment/comment.module";
import { FileStorageModule } from "./modules/file-storage/file-storage.module";
import { ListingModule } from "./modules/listing/listing.module";
import { MessagingModule } from "./modules/messaging/messaging.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		LoggerModule,
		AuthModule,
		DatabaseModule,
		UserModule,
		ListingModule,
		FileStorageModule,
		MailModule,
		MessagingModule,
		ModerationModule,
		CommentModule,
		NotificationModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
