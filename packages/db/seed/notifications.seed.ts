import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { notification } from "../schema";
import type { SeededListing } from "./listings.seed";
import type { SeededUser } from "./users.seed";
import { createId, past } from "./utils.seed";

export async function seedNotifications(
	db: NodePgDatabase<any>,
	users: Record<string, SeededUser>,
	listings: Record<string, SeededListing>,
) {
	console.log("🔔 Creating notifications...");

	const notificationRecords = [] as Array<typeof notification.$inferInsert>;

	// Helper to add notification
	const addNotification = (params: {
		userEmail: string;
		type:
			| "NEW_NEARBY_LISTING"
			| "MESSAGE_RECEIVED"
			| "COMMENT_ON_LISTING"
			| "LISTING_EXPIRED";
		title: string;
		body: string;
		read: boolean;
		data?: any;
		daysAgo: number;
	}) => {
		const targetUser = users[params.userEmail];
		if (targetUser) {
			notificationRecords.push({
				id: createId(),
				userId: targetUser.id,
				type: params.type,
				title: params.title,
				body: params.body,
				read: params.read,
				data: params.data ?? null,
				createdAt: past(params.daysAgo),
				updatedAt: past(params.daysAgo),
			});
		}
	};

	// --- Scenarios for Test User (test@gmail.com) ---

	// 1. Unread Message Notification
	const senderDave = users["dave@example.com"];
	addNotification({
		userEmail: "test@gmail.com",
		type: "MESSAGE_RECEIVED",
		title: "New message from Dave",
		body: "Dave sent you a message about the 'Stephen King Hardcover Set'.",
		read: false,
		data: { fromUserId: senderDave?.id },
		daysAgo: 0.16, // 4 hours ago
	});

	// 2. Unread Comment Notification
	const listingBooks = listings["Stephen King Hardcover Set"];
	addNotification({
		userEmail: "test@gmail.com",
		type: "COMMENT_ON_LISTING",
		title: "New comment on your listing",
		body: "Alice commented: 'Ah, got it. Still very interested...'",
		read: false,
		data: { listingId: listingBooks?.id },
		daysAgo: 0.08, // ~2 hours ago
	});

	// 3. Unread Listing Expired Notification
	const listingFrames = listings["Assorted picture frames"];
	addNotification({
		userEmail: "test@gmail.com",
		type: "LISTING_EXPIRED",
		title: "Your listing has expired",
		body: "Your listing 'Assorted picture frames' has expired.",
		read: false,
		data: { listingId: listingFrames?.id },
		daysAgo: 2,
	});

	// 4. Unread Nearby Listing Notification
	const listingNovelBox = listings["Box of paperback novels"];
	addNotification({
		userEmail: "test@gmail.com",
		type: "NEW_NEARBY_LISTING",
		title: "New item posted nearby",
		body: "Ben just posted a 'Box of paperback novels' near you!",
		read: false,
		data: { listingId: listingNovelBox?.id },
		daysAgo: 1.5,
	});

	// 5. Read notification (historical)
	const listingMixer = listings["Retro kitchen mixer"];
	addNotification({
		userEmail: "test@gmail.com",
		type: "NEW_NEARBY_LISTING",
		title: "New item posted nearby",
		body: "David just posted a 'Retro kitchen mixer' near you!",
		read: true,
		data: { listingId: listingMixer?.id },
		daysAgo: 5,
	});

	// --- Scenarios for Other Users ---

	// Alice: Message from Test User about IKEA KALLAX
	const testUser = users["test@gmail.com"];
	addNotification({
		userEmail: "alice@example.com",
		type: "MESSAGE_RECEIVED",
		title: "New message from Test User",
		body: "Test User sent you a message about the 'IKEA KALLAX shelf unit'.",
		read: false,
		data: { fromUserId: testUser?.id },
		daysAgo: 0.08,
	});

	// Dave: Message from Sarah about power drill
	const senderSarah = users["sarah@example.com"];
	addNotification({
		userEmail: "dave@example.com",
		type: "MESSAGE_RECEIVED",
		title: "New message from Sarah",
		body: "Sarah sent you a message about the 'Power drill (no battery)'.",
		read: true,
		data: { fromUserId: senderSarah?.id },
		daysAgo: 0.5,
	});

	await db.insert(notification).values(notificationRecords);
	console.log(`   ✓ ${notificationRecords.length} notifications created`);
}
