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
} from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import { Public } from "../auth/auth.decorator";
import type { UserSession } from "../auth/auth.type";
import { ListingService } from "./listing.service";

@Controller("listings")
export class ListingController {
	constructor(private readonly listingService: ListingService) {}

	/**
	 * Creates a new listing with item details and uploaded image URLs.
	 * Expects a JSON body validated against CreateListingSchema.
	 */
	@Post()
	create(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateListingSchema)) body: CreateListingDto,
	) {
		return this.listingService.create(session.user.id, body);
	}

	@Get("feed")
	@Public()
	findFeed(
		@Query(new ZodValidationPipe(FeedListingsQuerySchema))
		query: FeedListingsQueryOutputDto,
		@Session() session?: UserSession,
	) {
		return this.listingService.findFeed(query, session?.user.id);
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
