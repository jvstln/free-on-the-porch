import type { SendMessageDto } from "@free-on-the-porch/shared/schemas";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructures/database/prisma.service";

@Injectable()
export class MessagingService {
	constructor(private readonly prisma: PrismaService) {}

	async sendMessage(senderId: string, dto: SendMessageDto) {
		// Ensure receiver exists
		const receiver = await this.prisma.user.findUnique({
			where: { id: dto.receiverId },
			select: { id: true },
		});
		if (!receiver) throw new NotFoundException("Receiver not found");

		const message = await this.prisma.message.create({
			data: {
				body: dto.body,
				senderId,
				receiverId: dto.receiverId,
				listingId: dto.listingId ?? null,
			},
			include: {
				sender: { select: { id: true, name: true, image: true } },
				listing: { select: { id: true, title: true } },
			},
		});

		return message;
	}

	/**
	 * Returns all messages between two users, optionally scoped to a listing.
	 * Ordered oldest → newest for display.
	 */
	async getConversation(
		userId: string,
		otherUserId: string,
		listingId?: string,
		cursor?: string,
		limit = 30,
	) {
		const messages = await this.prisma.message.findMany({
			where: {
				OR: [
					{ senderId: userId, receiverId: otherUserId },
					{ senderId: otherUserId, receiverId: userId },
				],
				...(listingId ? { listingId } : {}),
			},
			include: {
				sender: { select: { id: true, name: true, image: true } },
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
		});

		// Mark unread messages as read
		await this.prisma.message.updateMany({
			where: {
				senderId: otherUserId,
				receiverId: userId,
				read: false,
			},
			data: { read: true },
		});

		return messages.reverse(); // oldest first for the UI
	}

	/**
	 * Returns a list of conversations (one entry per unique contact),
	 * with the latest message and unread count.
	 */
	async getInbox(userId: string) {
		// Raw query for efficient "latest message per thread" pattern
		const threads = await this.prisma.$queryRaw<
			{
				contact_id: string;
				contact_name: string;
				contact_image: string | null;
				last_message: string;
				last_message_at: Date;
				unread_count: bigint;
				listing_id: string | null;
				listing_title: string | null;
			}[]
		>`
      SELECT DISTINCT ON (contact_id)
        CASE
          WHEN m."senderId" = ${userId} THEN m."receiverId"
          ELSE m."senderId"
        END AS contact_id,
        u.name AS contact_name,
        u.image AS contact_image,
        m.body AS last_message,
        m."createdAt" AS last_message_at,
        (
          SELECT COUNT(*) FROM message unread
          WHERE unread."receiverId" = ${userId}
            AND unread."senderId" = CASE
              WHEN m."senderId" = ${userId} THEN m."receiverId"
              ELSE m."senderId"
            END
            AND unread.read = false
        ) AS unread_count,
        m."listingId" AS listing_id,
        l.title AS listing_title
      FROM message m
      JOIN "user" u ON u.id = CASE
        WHEN m."senderId" = ${userId} THEN m."receiverId"
        ELSE m."senderId"
      END
      LEFT JOIN listing l ON l.id = m."listingId"
      WHERE m."senderId" = ${userId} OR m."receiverId" = ${userId}
      ORDER BY contact_id, m."createdAt" DESC
    `;

		return threads.map((t) => ({
			...t,
			unread_count: Number(t.unread_count), // BigInt → number
		}));
	}

	async markRead(userId: string, senderId: string) {
		await this.prisma.message.updateMany({
			where: { senderId, receiverId: userId, read: false },
			data: { read: true },
		});
		return { success: true };
	}
}
