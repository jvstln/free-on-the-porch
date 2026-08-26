import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { comment } from "../schema";
import type { SeededListing } from "./listings.seed";
import type { SeededUser } from "./users.seed";
import { createId, past } from "./utils.seed";

export async function seedComments(
	db: NodePgDatabase<any>,
	users: Record<string, SeededUser>,
	listings: Record<string, SeededListing>,
) {
	console.log("💬 Creating comments...");

	const commentRecords = [] as Array<typeof comment.$inferInsert>;

	// Helper to add comment
	const addComment = (
		listingTitle: string,
		userEmail: string,
		body: string,
		daysAgo: number,
	) => {
		const targetListing = listings[listingTitle];
		const author = users[userEmail];
		if (targetListing && author) {
			commentRecords.push({
				id: createId(),
				listingId: targetListing.id,
				userId: author.id,
				body,
				createdAt: past(daysAgo),
				updatedAt: past(daysAgo),
			});
		}
	};

	// 1. Thread on Test User's listing "Stephen King Hardcover Set"
	addComment(
		"Stephen King Hardcover Set",
		"alice@example.com",
		"Are these the first editions?",
		3,
	);
	addComment(
		"Stephen King Hardcover Set",
		"test@gmail.com",
		"No, they are the 2011 pocket editions, but in pristine condition!",
		2,
	);
	addComment(
		"Stephen King Hardcover Set",
		"alice@example.com",
		"Ah, got it. Still very interested, I will send you a message!",
		2,
	);

	// 2. Test User commenting on Chloe's listing
	addComment(
		"Children's wooden toy train set",
		"test@gmail.com",
		"My nephew would love this. Can I collect tonight around 7 PM?",
		1,
	);
	addComment(
		"Children's wooden toy train set",
		"chloe@example.com",
		"Hi! Yes, 7 PM is perfect. I will leave it by the porch.",
		1,
	);

	// 3. Other user comments
	addComment(
		"Power drill (no battery)",
		"sarah@example.com",
		"Does it work with standard Makita 18v batteries?",
		4,
	);
	addComment(
		"Power drill (no battery)",
		"dave@example.com",
		"Yes, any standard Makita LXT battery fits fine.",
		3,
	);

	addComment(
		"Organic Tomato Starters",
		"ben@example.com",
		"Just what I needed for my backyard greenhouse! How many do you have left?",
		2,
	);
	addComment(
		"Organic Tomato Starters",
		"marcus@example.com",
		"I have about 6 small pots left. You can take all of them if you like.",
		1,
	);

	// 4. Random comments on other items
	addComment(
		"Yoga mat + 2 resistance bands",
		"chloe@example.com",
		"Is the mat thick? I have sensitive knees.",
		5,
	);
	addComment(
		"Retro kitchen mixer",
		"alice@example.com",
		"Oh this retro color is gorgeous! Still working fine?",
		6,
	);
	addComment(
		"Retro kitchen mixer",
		"david@example.com",
		"Yes, fully working. The whisk attachment has a tiny scratch but it blends perfectly.",
		5,
	);

	await db.insert(comment).values(commentRecords);
	console.log(`   ✓ ${commentRecords.length} comments created`);
}
