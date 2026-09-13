import {
	type CreateListingDto,
	CreateListingSchema,
	type FeedListingsQueryOutputDto,
	FeedListingsQuerySchema,
	type UpdateListingDto,
	UpdateListingSchema,
} from "@free-on-the-porch/shared/schemas";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Session,
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { FileStorageService } from "../../infrastructures/file-storage/file-storage.service";
import { Public } from "../auth/auth.decorator";
import type { UserSession } from "../auth/auth.type";
import { ListingService } from "./listing.service";

const MAX_IMAGES = 5;

@Controller("listings")
export class ListingController {
	constructor(
		private readonly listingService: ListingService,
		private readonly fileStorage: FileStorageService,
	) {}

	@Post()
	@UseInterceptors(
		FilesInterceptor("images", MAX_IMAGES, {
			storage: memoryStorage(),
			limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
		}),
	)
	async create(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateListingSchema)) body: CreateListingDto,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		let imageUrls: string[] = [];

		if (files && files.length > 0) {
			const uploads = await Promise.all(
				files.map((file) => this.fileStorage.uploadImage({ file })),
			);
			imageUrls = uploads.map((u) => u.url);
		}

		return this.listingService.create(session.user.id, body, imageUrls);
	}

	@Get("feed")
	@Public()
	findFeed(
		@Query(new ZodValidationPipe(FeedListingsQuerySchema))
		query: FeedListingsQueryOutputDto,
	) {
		return this.listingService.findFeed(query);
	}

	@Get("mine")
	findMine(@Session() session: UserSession) {
		return this.listingService.findByUser(session.user.id);
	}

	@Get("user/:userId")
	@Public()
	findByUser(@Param("userId") userId: string) {
		return this.listingService.findByUser(userId);
	}

	@Get(":id")
	@Public()
	findOne(@Param("id") id: string) {
		return this.listingService.findOne({ id });
	}

	@Post(":id/claim")
	claim(@Param("id") id: string, @Session() session: UserSession) {
		return this.listingService.claim(id, session.user.id);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(UpdateListingSchema)) body: UpdateListingDto,
	) {
		return this.listingService.update(id, session.user.id, body);
	}

	@Delete(":id")
	remove(@Param("id") id: string, @Session() session: UserSession) {
		return this.listingService.remove(id, session.user.id);
	}
}
