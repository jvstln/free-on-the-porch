import {
	type CreateCommentDto,
	CreateCommentSchema,
} from "@free-on-the-porch/shared/schemas";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Session,
} from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod.pipe";
import type { UserSession } from "../auth/auth.type";
import { CommentService } from "./comment.service";

@Controller("listings/:listingId/comments")
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Post()
	create(
		@Param("listingId") listingId: string,
		@Session() session: UserSession,
		@Body(new ZodValidationPipe(CreateCommentSchema)) body: CreateCommentDto,
	) {
		return this.commentService.create(listingId, session.user.id, body);
	}

	@Get()
	findByListing(@Param("listingId") listingId: string) {
		return this.commentService.findByListing(listingId);
	}

	@Delete(":id")
	remove(@Param("id") id: string, @Session() session: UserSession) {
		return this.commentService.remove(id, session.user.id);
	}
}
