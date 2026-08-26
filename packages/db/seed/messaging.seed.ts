import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { message, thread, threadMember } from "../schema";
import type { SeededListing } from "./listings.seed";
import type { SeededUser } from "./users.seed";
import { createId, past } from "./utils.seed";

export async function seedMessaging(
	db: NodePgDatabase<any>,
	users: Record<string, SeededUser>,
	listings: Record<string, SeededListing>,
) {
	console.log("✉️  Creating messages and threads...");

	const threadRecords = [] as Array<typeof thread.$inferInsert>;
	const threadMemberRecords = [] as Array<typeof threadMember.$inferInsert>;
	const messageRecords = [] as Array<typeof message.$inferInsert>;

	// Helper to create a thread and its messages
	const createConversation = (params: {
		type: "DM" | "LISTING";
		listingTitle?: string;
		creatorEmail: string;
		receiverEmail: string;
		messages: Array<{
			senderEmail: string;
			body: string;
			read: boolean;
			hoursAgo: number;
		}>;
	}) => {
		const creator = users[params.creatorEmail];
		const receiver = users[params.receiverEmail];
		if (!creator || !receiver) return;

		let listingId: string | null = null;
		if (params.type === "LISTING" && params.listingTitle) {
			const targetListing = listings[params.listingTitle];
			if (targetListing) {
				listingId = targetListing.id;
			}
		}

		const threadId = createId();

		threadRecords.push({
			id: threadId,
			type: params.type,
			listingId,
			createdAt: past(
				Math.max(...params.messages.map((m) => m.hoursAgo)) / 24 + 0.1,
			),
			updatedAt: past(Math.min(...params.messages.map((m) => m.hoursAgo)) / 24),
		});

		threadMemberRecords.push(
			{
				id: createId(),
				threadId,
				userId: creator.id,
				createdAt: past(
					Math.max(...params.messages.map((m) => m.hoursAgo)) / 24 + 0.1,
				),
				updatedAt: past(
					Math.max(...params.messages.map((m) => m.hoursAgo)) / 24 + 0.1,
				),
			},
			{
				id: createId(),
				threadId,
				userId: receiver.id,
				createdAt: past(
					Math.max(...params.messages.map((m) => m.hoursAgo)) / 24 + 0.1,
				),
				updatedAt: past(
					Math.max(...params.messages.map((m) => m.hoursAgo)) / 24 + 0.1,
				),
			},
		);

		for (const msg of params.messages) {
			const sender = users[msg.senderEmail];
			const msgReceiver =
				msg.senderEmail === params.creatorEmail ? receiver : creator;

			if (sender) {
				messageRecords.push({
					id: createId(),
					threadId,
					body: msg.body,
					read: msg.read,
					senderId: sender.id,
					createdAt: past(msg.hoursAgo / 24),
					updatedAt: past(msg.hoursAgo / 24),
				});
			}
		}
	};

	// 1. Thread 1: Listing Conversation (Type: "LISTING")
	// Test User is buyer (creator), Alice is seller (receiver)
	createConversation({
		type: "LISTING",
		listingTitle: "IKEA KALLAX shelf unit",
		creatorEmail: "test@gmail.com",
		receiverEmail: "alice@example.com",
		messages: [
			{
				senderEmail: "test@gmail.com",
				body: "Hi Alice! Is the KALLAX shelf still available?",
				read: true,
				hoursAgo: 24,
			},
			{
				senderEmail: "alice@example.com",
				body: "Yes! It is. I'm around most evenings this week.",
				read: true,
				hoursAgo: 18,
			},
			{
				senderEmail: "test@gmail.com",
				body: "Awesome! Is tonight around 8 PM okay for pickup?",
				read: false, // Unread by Alice (Test User sent it)
				hoursAgo: 2,
			},
		],
	});

	// 2. Thread 2: Listing Conversation (Type: "LISTING")
	// Dave is buyer (creator), Test User is seller (receiver)
	createConversation({
		type: "LISTING",
		listingTitle: "Stephen King Hardcover Set",
		creatorEmail: "dave@example.com",
		receiverEmail: "test@gmail.com",
		messages: [
			{
				senderEmail: "dave@example.com",
				body: "Hey there! I saw your Stephen King books. I can pick them up today if possible.",
				read: true,
				hoursAgo: 48,
			},
			{
				senderEmail: "test@gmail.com",
				body: "Hi! Yes, they are available. When are you free?",
				read: true,
				hoursAgo: 24,
			},
			{
				senderEmail: "dave@example.com",
				body: "I can come by in a truck around 6 PM. Does that work?",
				read: false, // Unread by Test User (Dave sent it)
				hoursAgo: 4,
			},
		],
	});

	// 3. Thread 3: DM Conversation (Type: "DM")
	// Test User is creator, Chloe is receiver
	createConversation({
		type: "DM",
		creatorEmail: "test@gmail.com",
		receiverEmail: "chloe@example.com",
		messages: [
			{
				senderEmail: "test@gmail.com",
				body: "Hi Chloe, thanks for the organic gardening tips last week! The tomatoes are doing great.",
				read: true,
				hoursAgo: 72,
			},
			{
				senderEmail: "chloe@example.com",
				body: "No problem at all! Let me know if you need any more starter advice.",
				read: true,
				hoursAgo: 48,
			},
		],
	});

	// 4. Thread 4: DM Conversation (Type: "DM")
	// David is creator, Test User is receiver
	createConversation({
		type: "DM",
		creatorEmail: "david@example.com",
		receiverEmail: "test@gmail.com",
		messages: [
			{
				senderEmail: "david@example.com",
				body: "Hi, I saw you were looking for vintage picture frames. I have a few extra if you want them.",
				read: false, // Unread by Test User
				hoursAgo: 5,
			},
		],
	});

	// 5. Thread 5: DM not involving Test User (Sarah and Dave)
	createConversation({
		type: "DM",
		creatorEmail: "sarah@example.com",
		receiverEmail: "dave@example.com",
		messages: [
			{
				senderEmail: "sarah@example.com",
				body: "Hi Dave, did you find that power drill battery?",
				read: true,
				hoursAgo: 24,
			},
			{
				senderEmail: "dave@example.com",
				body: "Hey Sarah. No, it was completely dead. Just listed the drill body only.",
				read: true,
				hoursAgo: 12,
			},
		],
	});

	// 6. Thread 6: Listing Conversation not involving Test User (Ben and Marcus)
	createConversation({
		type: "LISTING",
		listingTitle: "Organic Tomato Starters",
		creatorEmail: "ben@example.com",
		receiverEmail: "marcus@example.com",
		messages: [
			{
				senderEmail: "ben@example.com",
				body: "Hi Marcus, are the tomato starters still out?",
				read: true,
				hoursAgo: 24,
			},
			{
				senderEmail: "marcus@example.com",
				body: "They are right next to the driveway. Grab as many as you need!",
				read: true,
				hoursAgo: 20,
			},
		],
	});

	if (threadRecords.length > 0) {
		await db.insert(thread).values(threadRecords);
	}
	if (threadMemberRecords.length > 0) {
		await db.insert(threadMember).values(threadMemberRecords);
	}
	if (messageRecords.length > 0) {
		await db.insert(message).values(messageRecords);
	}

	console.log(
		`   ✓ ${threadRecords.length} threads and ${messageRecords.length} messages created`,
	);
}
