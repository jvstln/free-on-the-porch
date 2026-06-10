import { Global, Module } from "@nestjs/common";
import { cloudinaryProvider } from "./cloudinary.provider";
import { FileStorageService } from "./file-storage.service";

@Global()
@Module({
	providers: [cloudinaryProvider, FileStorageService],
	exports: [FileStorageService],
})
export class FileStorageModule {}
