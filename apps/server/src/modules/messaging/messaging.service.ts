import {
	listing,
	message,
	publicUserSelectFields,
	thread,
	threadMember,
	user,
} from "@free-on-the-porch/db";
import {
	type ConversationDto,
	type ConversationQueryOutputDto,
	ConversationSchema,
	type PaginatedResponse,
	type SendMessageDto,
	type ThreadDto,
	type ThreadsQueryOutputDto,
} from "@free-on-the-porch/shared/schemas";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { and, asc, desc, eq, exists, max, sql } from "drizzle-orm";
import {
	buildResponse,
	decodeCursor,
} from "../../common/utils/pagination.util";
import { DrizzleService } from "../../infrastructures/database/database.service";

@Injectable()
// Messaging domain service: thread creation/resolution, message sending,
// conversation fetching, and read receipts.
//
// Thread model: a thread is either a LISTING thread (tied to a listing, e.g.
// created when someone claims) or a DM thread (ad-hoc between two users).
// Membership is tracked via the thread_member join table.
export class MessagingService {
	constructor(private readonly drizzle: DrizzleService) {}

	// Sends a message. The thread is either provided explicitly (threadId) or
	// resolved/created from a listingId or receiverId.
	//
	// Returns { message, memberIds } so the controller can broadcast the new
	// message to the other participants over WebSockets.
	async sendMessage(senderId: string, dto: SendMessageDto) {
		let threadId = dto.threadId;

		if (threadId) {
			// Verify that the thread exists and the sender is a member of it
			const isMember = await this.drizzle.db.query.threadMember.findFirst({
				where: {
					threadId,
					userId: senderId,
				},
			});
			if (!isMember) {
				throw new BadRequestException("User is not a member of this thread");
			}
		} else {
			// Either listingId or receiverId is required
			if (!dto.listingId && !dto.receiverId) {
				throw new BadRequestException(
					"Either threadId, listingId, or receiverId must be provided",
				);
			}

			// Resolve/create a LISTING thread.
			if (dto.listingId) {
				const foundListing = await this.drizzle.db.query.listing.findFirst({
					columns: { userId: true },
					where: { id: dto.listingId },
				});
				if (!foundListing) throw new NotFoundException("Listing not found");
				if (foundListing.userId === senderId)
					throw new BadRequestException("You cannot message yourself");

				// Reuse an existing LISTING thread only if BOTH the sender and
				// receiver are already members (avoids duplicate conversations).
				const existingThread = await this.drizzle.db.query.thread.findFirst({
					where: {
						type: "LISTING",
						listingId: dto.listingId,
						AND: [
							{ threadMembers: { userId: senderId } },
							{ threadMembers: { userId: foundListing.userId } },
						],
					},
				});

				if (existingThread) {
					threadId = existingThread.id;
				} else {
					// Create new listing thread
					const newThread = await this.drizzle.db.transaction(async (tx) => {
						const [t] = await tx
							.insert(thread)
							.values({
								type: "LISTING",
								listingId: dto.listingId,
							})
							.returning();

						if (!t) throw new Error("Failed to create listing thread");

						await tx.insert(threadMember).values([
							{ threadId: t.id, userId: senderId },
							{ threadId: t.id, userId: foundListing.userId },
						]);

						return t;
					});
					threadId = newThread.id;
				}
			} else {
				// Resolve/create a DM thread.
				const receiverId = dto.receiverId;
				if (!receiverId) {
					throw new BadRequestException(
						"Receiver ID is required for direct messages",
					);
				}

				if (receiverId === senderId)
					throw new BadRequestException("You cannot message yourself");

				const receiverExists = await this.drizzle.db.query.user.findFirst({
					columns: { id: true },
					where: {
						id: receiverId,
					},
				});
				if (!receiverExists) throw new NotFoundException("Receiver not found");

				// Reuse an existing DM thread only if both members are present.
				const existingThread = await this.drizzle.db.query.thread.findFirst({
					where: {
						type: "DM",
						AND: [
							{ threadMembers: { userId: senderId } },
							{ threadMembers: { userId: receiverId } },
						],
					},
				});

				if (existingThread) {
					threadId = existingThread.id;
				} else {
					// Create new DM thread
					const newThread = await this.drizzle.db.transaction(async (tx) => {
						const [t] = await tx
							.insert(thread)
							.values({
								type: "DM",
							})
							.returning();
						if (!t) throw new Error("Failed to create DM thread");

						await tx.insert(threadMember).values([
							{ threadId: t.id, userId: senderId },
							{ threadId: t.id, userId: receiverId },
						]);

						return t;
					});

					threadId = newThread.id;
				}
			}
		}

		if (!threadId) {
			throw new BadRequestException(
				"Failed to resolve or create conversation thread",
			);
		}

		// Insert message
		const [newMessage] = await this.drizzle.db
			.insert(message)
			.values({
				body: dto.body,
				senderId,
				threadId,
			})
			.returning();

		if (!newMessage) {
			throw new Error("Failed to send message");
		}

		// Bump the thread's updatedAt so it surfaces to the top of the inbox
		// (threads are ordered by max message updatedAt).
		await this.drizzle.db
			.update(thread)
			.set({ updatedAt: new Date() })
			.where(eq(thread.id, threadId));

		// Find members of the thread to return to gateway for broadcasting
		const members = await this.drizzle.db
			.select({ userId: threadMember.userId })
			.from(threadMember)
			.where(eq(threadMember.threadId, threadId));

		return {
			message: newMessage,
			memberIds: members.map((m) => m.userId),
		};
	}

	// Fetches a single conversation by type/id where type is one of:
	// "threads" (by thread id), "listings" (by listing id), or "users" (a DM by
	// the other user's id). Always enforces that the requesting user is a member.
	// Messages are fetched newest-first via cursor pagination; for a DM with no
	// existing thread yet, an empty "shell" conversation is synthesized.
	async getConversation(
		userId: string,
		query: ConversationQueryOutputDto,
	): Promise<PaginatedResponse<ConversationDto>> {
		const getCursor = (message: ConversationDto["messages"][0]) => ({
			id: message.id,
			createdAt: message.createdAt,
		});
		const decodedCursor = decodeCursor<ReturnType<typeof getCursor>>(
			query.cursor,
		);

		const conversation = await this.drizzle.db.query.thread.findFirst({
			where: {
				// Current user must always be a member
				RAW: (t) =>
					exists(
						this.drizzle.db
							.select({ id: threadMember.id })
							.from(threadMember)
							.where(
								and(
									eq(threadMember.threadId, t.id),
									eq(threadMember.userId, userId),
								),
							),
					),
				...(query.type === "threads"
					? { id: query.id }
					: query.type === "listings"
						? { listingId: query.id }
						: query.type === "users"
							? { type: "DM" }
							: null),
			},
			with: {
				messages: {
					where: {
						...(decodedCursor
							? {
									OR: [
										{ createdAt: { lt: new Date(decodedCursor.createdAt) } },
										{
											createdAt: { eq: new Date(decodedCursor.createdAt) },
											id: { lt: decodedCursor.id },
										},
									],
								}
							: null),
					},
					orderBy: { createdAt: "desc", id: "desc" },
					limit: query.limit + 1,
				},
				members: {
					columns: publicUserSelectFields,
					orderBy: (t) => eq(t.id, userId),
				},
				listing: { with: { images: true } },
			},
		});

		// For DM lookups, verify the target user is also a member
		if (conversation && query.type === "users") {
			const targetIsMember = await this.drizzle.db.query.threadMember.findFirst(
				{
					where: {
						threadId: conversation.id,
						userId: query.id,
					},
				},
			);
			if (!targetIsMember) {
				throw new NotFoundException(
					`Conversation ${query.type}:${query.id} not found`,
				);
			}
		}

		if (!conversation) {
			if (query.type === "users") {
				// Retrieve the other user to populate members
				const otherUserObj = await this.drizzle.db.query.user.findFirst({
					where: {
						id: query.id,
					},
					columns: publicUserSelectFields,
				});
				if (!otherUserObj) throw new NotFoundException("User not found");

				const currentUserObj = await this.drizzle.db.query.user.findFirst({
					where: {
						id: userId,
					},
					columns: publicUserSelectFields,
				});

				return {
					data: ConversationSchema.parse({
						id: `dm-${query.id}`,
						type: "DM",
						listingId: null,
						createdAt: new Date(),
						updatedAt: new Date(),
						members: [otherUserObj, currentUserObj!],
						messages: [],
						listing: null,
					}),
					pagination: {
						nextCursor: null,
					},
				};
			}

			throw new NotFoundException(
				`Conversation ${query.type}:${query.id} not found`,
			);
		}

		const { pagination, data: messages } = buildResponse(
			conversation.messages,
			{ type: "cursor", limit: query.limit, getCursor },
		);

		return {
			data: ConversationSchema.parse({ ...conversation, messages }),
			pagination,
		};
	}

	// Lists the user's conversations (inbox), cursor-paginated and ordered by
	// the most-recent message's updatedAt (newest first, threads with no
	// messages last). Each thread includes its members, optional listing, and
	// the last 5 messages.
	async getThreads(
		userId: string,
		query: ThreadsQueryOutputDto,
	): Promise<PaginatedResponse<ThreadDto[]>> {
		const getCursor = (t: ThreadDto) => ({
			id: t.id,
			lastMessageUpdatedAt: t.messages[0]?.updatedAt ?? t.updatedAt,
		});
		const decodedCursor = decodeCursor<ReturnType<typeof getCursor>>(
			query.cursor,
		);

		const threads = await this.drizzle.db.query.thread.findMany({
			where: {
				type: query.type,
				threadMembers: {
					userId,
				},
				...(decodedCursor
					? {
							OR: [
								{
									messages: {
										updatedAt: {
											lt: new Date(decodedCursor.lastMessageUpdatedAt),
										},
									},
								},
								{
									id: { lt: decodedCursor.id },
									messages: {
										updatedAt: {
											eq: new Date(decodedCursor.lastMessageUpdatedAt),
										},
									},
								},
							],
						}
					: null),
			},
			with: {
				members: {
					columns: publicUserSelectFields,
					orderBy: (t) => eq(t.id, userId), // Makes the current user the last item in the array
				},
				listing: { with: { images: true } },
				messages: {
					orderBy: {
						updatedAt: "desc",
						id: "desc",
					},
					limit: 5,
				},
			},
			orderBy: (t) =>
				desc(
					this.drizzle.db
						.select({ val: max(message.updatedAt) })
						.from(message)
						.where(eq(message.threadId, t.id)),
				).append(sql` NULLS LAST`),
			limit: query.limit + 1,
		});

		return buildResponse(threads, {
			type: "cursor",
			getCursor,
			limit: query.limit,
		});
	}

	async markRead(userId: string, senderId: string, threadId: string) {
		// Verify the current user is a member of this thread
		const isMember = await this.drizzle.db.query.threadMember.findFirst({
			where: {
				threadId,
				userId,
			},
		});
		if (!isMember) {
			throw new BadRequestException("User is not a member of this thread");
		}

		await this.drizzle.db
			.update(message)
			.set({ read: true })
			.where(
				and(
					eq(message.threadId, threadId),
					eq(message.senderId, senderId),
					eq(message.read, false),
				),
			);
		return { success: true };
	}
}
