import {
	type CreateListingDto,
	CreateListingSchema,
	type NearbyQueryDto,
	NearbyQuerySchema,
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
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import type { UserSession } from "../auth/auth.type";
import { ListingService } from "./listing.service";

@ApiTags("Listings")
@ApiBearerAuth()
@Controller("listings")
export class ListingController {
	constructor(private readonly listingService: ListingService) {}

	@Post()
	@ApiOperation({ summary: "Create a new listing" })
	create(
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateListingSchema)) body: CreateListingDto,
	) {
		// imageUrls come from the upload module — empty array for now
		return this.listingService.create(session.user.id, body, []);
	}

	@Get("nearby")
	@ApiOperation({ summary: "Get nearby available listings" })
	@ApiQuery({ name: "lat", type: Number })
	@ApiQuery({ name: "lng", type: Number })
	@ApiQuery({ name: "radiusKm", type: Number, required: false })
	@ApiQuery({ name: "category", required: false })
	@ApiQuery({ name: "limit", type: Number, required: false })
	findNearby(
		@Query(new ZodValidationPipe(NearbyQuerySchema)) query: NearbyQueryDto,
	) {
		return this.listingService.findNearby(query);
	}

	@Get("mine")
	@ApiOperation({ summary: "Get listings by the current user" })
	findMine(@Session() session: UserSession) {
		return this.listingService.findByUser(session.user.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single listing by ID" })
	findOne(@Param("id") id: string) {
		return this.listingService.findOne(id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a listing (owner only)" })
	update(
		@Param("id") id: string,
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(UpdateListingSchema)) body: UpdateListingDto,
	) {
		return this.listingService.update(id, session.user.id, body);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a listing (owner only)" })
	remove(@Param("id") id: string, @Session() session: UserSession) {
		return this.listingService.remove(id, session.user.id);
	}
}
