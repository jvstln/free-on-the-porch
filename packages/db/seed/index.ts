import { db } from "../index";
import {
	account,
	block,
	comment,
	listing,
	listingClaimRequest,
	listingImage,
	message,
	notification,
	report,
	session,
	thread,
	threadMember,
	user,
	verification,
} from "../schema";
import { seedComments } from "./comments.seed";
import { seedListings } from "./listings.seed";
import { seedMessaging } from "./messaging.seed";
import { seedModeration } from "./moderation.seed";
import { seedNotifications } from "./notifications.seed";
import { seedUsers } from "./users.seed";

// Seed orchestrator. Run via `pnpm db:seed` (tsx --env-file=../../.env).
//
// Flow: wipe the database (in FK dependency order — leaves before parents),
// then seed each domain in dependency order. Each seedX function accepts the
// entities produced by the previous stage so it can reference them by FK.
export async function main() {
	console.log("🌱 Seeding database...\n");

	console.log("🧹 Cleaning up database...");
	await db.delete(block);
	await db.delete(report);
	await db.delete(notification);
	await db.delete(message);
	await db.delete(threadMember);
	await db.delete(thread);
	await db.delete(comment);
	await db.delete(listingImage);
	await db.delete(listingClaimRequest);
	await db.delete(listing);
	await db.delete(session);
	await db.delete(account);
	await db.delete(verification);
	await db.delete(user);
	console.log("   ✓ Database cleaned");

	// Seed Users
	const users = await seedUsers(db);

	// Seed Listings
	const listings = await seedListings(db, users);

	// Seed Comments
	await seedComments(db, users, listings);

	// Seed Threads and Messages
	await seedMessaging(db, users, listings);

	// Seed Notifications
	await seedNotifications(db, users, listings);

	// Seed Moderation (reports, blocks)
	await seedModeration(db, users, listings);

	console.log("\n✅ Seed complete!\n");
	console.log("Test accounts (password: Pass@123):");
	console.log(
		"   test@gmail.com (Test User - specific hashed password retained)",
	);
	for (const email of Object.keys(users)) {
		if (email !== "test@gmail.com") {
			console.log(`   ${email}`);
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	});
