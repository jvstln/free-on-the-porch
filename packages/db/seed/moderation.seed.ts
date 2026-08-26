import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { block, report } from "../schema";
import type { SeededListing } from "./listings.seed";
import type { SeededUser } from "./users.seed";
import { createId, past } from "./utils.seed";

export async function seedModeration(
	db: NodePgDatabase<any>,
	users: Record<string, SeededUser>,
	listings: Record<string, SeededListing>,
) {
	console.log("🚩 Creating reports and blocks...");

	const reportRecords = [] as Array<typeof report.$inferInsert>;
	const blockRecords = [] as Array<typeof block.$inferInsert>;

	// 1. Reports by Test User
	const testUser = users["test@gmail.com"];
	const targetListing = listings["Old HP laptop (for parts)"];

	if (testUser && targetListing) {
		reportRecords.push({
			id: createId(),
			reason: "SPAM",
			details:
				"User is repeatedly posting the same cracked laptop model under different accounts.",
			resolved: false,
			reportedById: testUser.id,
			listingId: targetListing.id,
			createdAt: past(2),
			updatedAt: past(2),
		});
	}

	const davidUser = users["david@example.com"];
	if (testUser && davidUser) {
		reportRecords.push({
			id: createId(),
			reason: "INAPPROPRIATE",
			details: "Suspicious profile avatar and profile bio description.",
			resolved: true,
			reportedById: testUser.id,
			reportedUserId: davidUser.id,
			createdAt: past(5),
			updatedAt: past(4), // Resolved after 1 day
		});
	}

	// 2. Report by Ben on Dave's listing
	const benUser = users["ben@example.com"];
	const targetDrill = listings["Power drill (no battery)"];
	if (benUser && targetDrill) {
		reportRecords.push({
			id: createId(),
			reason: "ALREADY_TAKEN",
			details: "This item was picked up weeks ago, listing is still up.",
			resolved: false,
			reportedById: benUser.id,
			listingId: targetDrill.id,
			createdAt: past(1),
			updatedAt: past(1),
		});
	}

	// 3. Block by Test User on Marcus
	const marcusUser = users["marcus@example.com"];
	if (testUser && marcusUser) {
		blockRecords.push({
			id: createId(),
			blockerId: testUser.id,
			blockedId: marcusUser.id,
			createdAt: past(10),
			updatedAt: past(10),
		});
	}

	// 4. Block by Chloe on Test User (to test blocked by someone else)
	const chloeUser = users["chloe@example.com"];
	if (chloeUser && testUser) {
		blockRecords.push({
			id: createId(),
			blockerId: chloeUser.id,
			blockedId: testUser.id,
			createdAt: past(7),
			updatedAt: past(7),
		});
	}

	if (reportRecords.length > 0) {
		await db.insert(report).values(reportRecords);
	}
	if (blockRecords.length > 0) {
		await db.insert(block).values(blockRecords);
	}

	console.log(
		`   ✓ ${reportRecords.length} reports and ${blockRecords.length} blocks created`,
	);
}
