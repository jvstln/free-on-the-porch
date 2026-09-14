import { Global, Module } from "@nestjs/common";
import { cloudinaryProvider } from "./cloudinary.provider";
import { FileStorageController } from "./file-storage.controller";
import { FileStorageService } from "./file-storage.service";

@Global()
@Module({
	controllers: [FileStorageController],
	providers: [cloudinaryProvider, FileStorageService],
	exports: [FileStorageService],
})
export class FileStorageModule {}
