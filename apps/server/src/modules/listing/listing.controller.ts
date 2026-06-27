import {
	type CreateListingDto,
	CreateListingSchema,
	type NearbyListingsQueryOutputDto,
	NearbyListingsQuerySchema,
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

	@Post()
	create(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateListingSchema)) body: CreateListingDto,
	) {
		// imageUrls come from the upload module — empty array for now
		return this.listingService.create(session.user.id, body, []);
	}

	@Get("nearby")
	@Public()
	findNearby(
		@Query(new ZodValidationPipe(NearbyListingsQuerySchema))
		query: NearbyListingsQueryOutputDto,
	) {
		return this.listingService.findNearby(query);
	}

	@Get("mine")
	findMine(@Session() session: UserSession) {
		return this.listingService.findByUser(session.user.id);
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
