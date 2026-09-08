import { Module } from "@nestjs/common";
import { FileStorageModule } from "../../infrastructures/file-storage/file-storage.module";
import { ListingController } from "./listing.controller";
import { ListingService } from "./listing.service";

@Module({
	imports: [FileStorageModule],
	controllers: [ListingController],
	providers: [ListingService],
	exports: [ListingService],
})
export class ListingModule {}
