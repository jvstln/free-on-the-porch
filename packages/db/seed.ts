/**
 * Seed script for Free on the Porch
 * Run with: npx tsx packages/db/seed.ts (from repo root)
 * Or: node --env-file=../../apps/server/.env -e "import('./seed.ts')"
 */
/** biome-ignore-all lint/style/noNonNullAssertion: This is a seed script */

import { db } from "./index";
import {
	account,
	block,
	comment,
	listing,
	listingImage,
	message,
	notification,
	report,
	user,
} from "./schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

const createId = () => crypto.randomUUID();

const future = (days: number) =>
	new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const past = (days: number) =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/** Spread coords slightly around a base point */
const jitter = (base: number, range = 0.02) =>
	base + (Math.random() - 0.5) * range;

// ─── Seed Data ──────────────────────────────────────────────────────────────

// Base location: Hounslow, London
const BASE_LAT = 51.4746;
const BASE_LNG = -0.3614;

const USERS = [
	{
		name: "Alice Morgan",
		email: "alice@example.com",
		bio: "Love giving things a second life 🌿",
		image: "https://i.pravatar.cc/150?img=47",
	},
	{
		name: "Ben Clarke",
		email: "ben@example.com",
		bio: "Decluttering one item at a time.",
		image: "https://i.pravatar.cc/150?img=12",
	},
	{
		name: "Chloe Patel",
		email: "chloe@example.com",
		bio: "Sustainability advocate & avid freecycler.",
		image: "https://i.pravatar.cc/150?img=32",
	},
	{
		name: "David Osei",
		email: "david@example.com",
		bio: null,
		image: "https://i.pravatar.cc/150?img=53",
	},
	{
		name: "Emma Walsh",
		email: "emma@example.com",
		bio: "Moving house — everything must go!",
		image: "https://i.pravatar.cc/150?img=25",
	},
	// Users from native app mock data
	{
		name: "Sarah Jenkins",
		email: "sarah@example.com",
		bio: "Sustainability advocate & wood crafting enthusiast. Decluttering one item at a time! 🌿",
		image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
	},
	{
		name: "Dave Miller",
		email: "dave@example.com",
		bio: "DIY enthusiast and tool collector.",
		image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
	},
	{
		name: "Marcus Chen",
		email: "marcus@example.com",
		bio: "Urban gardener and plant lover 🌱",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
	},
] as const;

// Combined listings from both sources (deduplicated)
const LISTINGS = [
	{
		title: "IKEA KALLAX shelf unit",
		description:
			"White 4x4 KALLAX, good condition. A few scuffs on the base but fully functional. You collect.",
		category: "FURNITURE" as const,
		condition: "GOOD" as const,
		status: "AVAILABLE" as const,
		address: "14 Spring Grove Rd, Hounslow",
		images: [
			"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
			"https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600",
		],
	},
	{
		title: "Box of paperback novels",
		description:
			"Around 20 mixed fiction paperbacks — thrillers, romance, a bit of sci-fi. Take some or all.",
		category: "BOOKS" as const,
		condition: "FAIR" as const,
		status: "AVAILABLE" as const,
		address: "3 Bath Rd, Hounslow",
		images: [
			"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
		],
	},
	{
		title: "Children's wooden toy train set",
		description:
			"Complete Brio-compatible set. All pieces present. My kids have outgrown it.",
		category: "TOYS" as const,
		condition: "LIKE_NEW" as const,
		status: "AVAILABLE" as const,
		address: "27 Lampton Rd, Hounslow",
		images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600"],
	},
	{
		title: "Retro kitchen mixer",
		description:
			"Works perfectly, just upgrading. Comes with dough hook and whisk attachment.",
		category: "KITCHEN" as const,
		condition: "GOOD" as const,
		status: "AVAILABLE" as const,
		address: "Hounslow Central",
		images: [
			"https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600",
		],
	},
	{
		title: "Yoga mat + 2 resistance bands",
		description:
			"Used twice. Non-slip mat, 6mm thick. Bands are light and medium.",
		category: "SPORTS" as const,
		condition: "LIKE_NEW" as const,
		status: "AVAILABLE" as const,
		address: "Hounslow West",
		images: [
			"https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600",
		],
	},
	{
		title: "Old HP laptop (for parts)",
		description:
			"Screen cracked, but keyboard, RAM and battery are fine. Great for parts or tinkering.",
		category: "ELECTRONICS" as const,
		condition: "WORN" as const,
		status: "AVAILABLE" as const,
		address: "Isleworth, TW7",
		images: [
			"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
		],
	},
	{
		title: "Bundle of kids' clothes age 3–5",
		description:
			"About 15 items, mostly Next and H&M. Clean and in good condition.",
		category: "CLOTHING" as const,
		condition: "GOOD" as const,
		status: "PICKED_UP" as const,
		address: "Brentford, TW8",
		images: [
			"https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600",
		],
	},
	{
		title: "Garden trowel + fork set",
		description:
			"Stainless steel, wooden handles. Light rust on trowel tip but usable.",
		category: "GARDEN" as const,
		condition: "FAIR" as const,
		status: "AVAILABLE" as const,
		address: "Feltham, TW13",
		images: [
			"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
		],
	},
	{
		title: "Power drill (no battery)",
		description:
			"Makita 18V body only — battery died and I replaced the whole set. Drill head itself is fine.",
		category: "TOOLS" as const,
		condition: "GOOD" as const,
		status: "AVAILABLE" as const,
		address: "Hanworth, TW13",
		images: [
			"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",
		],
	},
	{
		title: "Assorted picture frames",
		description:
			"6 frames ranging from A5 to A3. Wood and plastic mix. No glass breakage.",
		category: "OTHER" as const,
		condition: "GOOD" as const,
		status: "EXPIRED" as const,
		address: "Whitton, TW2",
		images: [
			"https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
		],
	},
	{
		title: "Vintage Oak Coffee Table",
		description:
			"Beautiful vintage oak coffee table in good condition. Minor surface scratches but solid construction.",
		category: "FURNITURE" as const,
		condition: "GOOD" as const,
		status: "AVAILABLE" as const,
		address: "Maplewood Terrace",
		images: [
			"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600",
		],
	},
	{
		title: "Baby Crib & Mattress",
		description:
			"Sturdy baby crib with mattress included. Good condition, no stains or damage.",
		category: "TOYS" as const,
		condition: "GOOD" as const,
		status: "PICKED_UP" as const,
		address: "Elm Road",
		images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=600"],
	},
	{
		title: "Organic Tomato Starters",
		description:
			"Healthy organic tomato starter plants. Ready to transplant into your garden.",
		category: "GARDEN" as const,
		condition: "NEW" as const,
		status: "AVAILABLE" as const,
		address: "Baker Street",
		images: [
			"https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600",
		],
	},
	{
		title: "Stephen King Hardcover Set",
		description:
			"Collection of Stephen King hardcovers in good condition. Perfect for horror fans.",
		category: "BOOKS" as const,
		condition: "GOOD" as const,
		status: "AVAILABLE" as const,
		address: "Jefferson Ave",
		images: [
			"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
		],
	},
	{
		title: "Ninja High-Speed Blender",
		description:
			"Ninja blender in fair condition. Works well, some cosmetic wear on the base.",
		category: "KITCHEN" as const,
		condition: "FAIR" as const,
		status: "AVAILABLE" as const,
		address: "Crestwood Ave",
		images: [
			"https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600",
		],
	},
	{
		title: "Sony Noise Cancelling Headphones",
		description:
			"Sony headphones, well-worn but still functional. Ear pads show some wear.",
		category: "ELECTRONICS" as const,
		condition: "WORN" as const,
		status: "AVAILABLE" as const,
		address: "Prospect Street",
		images: [
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
		],
	},
	{
		title: "Levi's Denim Jacket (Medium)",
		description:
			"Classic Levi's denim jacket, size medium. Barely worn, like-new condition.",
		category: "CLOTHING" as const,
		condition: "LIKE_NEW" as const,
		status: "AVAILABLE" as const,
		address: "Oakwood Drive",
		images: [
			"https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
		],
	},
	{
		title: "Bosch Power Drill",
		description:
			"Bosch power drill in like-new condition. Comes with a set of drill bits and carrying case.",
		category: "TOOLS" as const,
		condition: "LIKE_NEW" as const,
		status: "AVAILABLE" as const,
		address: "Valley Street",
		images: [
			"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",
		],
	},
];

const COMMENTS = [
	"Is this still available?",
	"Would love this! Can I pick up tomorrow morning?",
	"What time can I collect?",
	"Lovely item, thanks for listing!",
	"I can come today if still going 🙌",
	"Just sent you a message!",
	"Perfect, we needed exactly this.",
];

const MESSAGES = [
	["Hi! Is the shelf still available?", "Yes! Come any evening this week."],
	[
		"Can I pick up the books on Saturday?",
		"Saturday works great, see you then!",
	],
	[
		"Still have the toy train set?",
		"It's gone actually, sorry! I have some other toys if interested.",
	],
	[
		"What area are you in exactly?",
		"Just off Spring Grove Road near the park.",
	],
	// From native app mock data
	[
		"Hi! I saw your post for the vintage coffee table.",
		"Hey there! Yes, it's still sitting on the porch.",
	],
	[
		"Is this still available for pickup tonight? I can come by in a truck around 6 PM.",
		"Perfect! I'll leave it out for you.",
	],
	[
		"Hey Dave, is the power drill still available?",
		"Yes it is! I just placed it outside on the workbench by the driveway.",
	],
	[
		"Hello Emma, I can pick up the baby crib today if it's available.",
		"Sure! Let know when you arrive.",
	],
	[
		"Hi Marcus, are the tomato starters still out?",
		"They are on the driveway right next to the garage. Feel free to grab as many as you need!",
	],
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	console.log("🌱 Seeding database...\n");

	// ── Users ──────────────────────────────────────────────────────────────────
	console.log("👤 Creating users...");
	const password = "Pass@123";

	const userIds = USERS.map(() => createId());

	await db.insert(user).values(
		USERS.map((u, i) => ({
			id: userIds[i]!,
			name: u.name,
			email: u.email,
			emailVerified: true,
			image: u.image,
			bio: u.bio ?? null,
		})),
	);

	await db.insert(account).values(
		USERS.map((_, i) => ({
			id: createId(),
			accountId: userIds[i]!,
			providerId: "credential",
			userId: userIds[i]!,
			password,
		})),
	);

	const [aliceId, benId, chloeId, davidId, emmaId, sarahId, daveId, marcusId] =
		userIds;

	console.log(`   ✓ ${USERS.length} users created`);

	// ── Listings ───────────────────────────────────────────────────────────────
	console.log("📦 Creating listings...");

	// Cycle through all users as owners
	const listingOwners = LISTINGS.map((_, i) => userIds[i % userIds.length]!);
	const listingIds = LISTINGS.map(() => createId());

	await db.insert(listing).values(
		LISTINGS.map((l, i) => ({
			id: listingIds[i]!,
			title: l.title,
			description: l.description,
			category: l.category,
			condition: l.condition,
			status: l.status,
			location: { lat: jitter(BASE_LAT), lng: jitter(BASE_LNG) },
			address: l.address,
			expiresAt: l.status === "EXPIRED" ? past(2) : future(7),
			userId: listingOwners[i]!,
		})),
	);

	// ── Listing Images ─────────────────────────────────────────────────────────
	const imageRows = LISTINGS.flatMap((l, i) =>
		l.images.map((url, order) => ({
			id: createId(),
			url,
			order,
			listingId: listingIds[i]!,
		})),
	);

	await db.insert(listingImage).values(imageRows);

	console.log(
		`   ✓ ${LISTINGS.length} listings created with ${imageRows.length} images`,
	);

	// ── Comments ───────────────────────────────────────────────────────────────
	console.log("💬 Creating comments...");

	const commentRows = listingIds.slice(0, 8).flatMap((lId, li) =>
		[0, 1].map((ci) => ({
			id: createId(),
			body: COMMENTS[(li + ci) % COMMENTS.length]!,
			listingId: lId!,
			userId: userIds[(li + ci + 1) % userIds.length]!,
			createdAt: past(ci),
		})),
	);

	await db.insert(comment).values(commentRows);
	console.log(`   ✓ ${commentRows.length} comments created`);

	// ── Messages ───────────────────────────────────────────────────────────────
	console.log("✉️  Creating messages...");

	const messageRows = MESSAGES.flatMap(([msgA, msgB], i) => {
		const senderId = userIds[i % userIds.length]!;
		const receiverId = userIds[(i + 1) % userIds.length]!;
		const relatedListingId = listingIds[i % listingIds.length]!;

		return [
			{
				id: createId(),
				body: msgA!,
				senderId,
				receiverId,
				listingId: relatedListingId,
				read: true,
				createdAt: past(1),
			},
			{
				id: createId(),
				body: msgB!,
				senderId: receiverId,
				receiverId: senderId,
				listingId: relatedListingId,
				read: false,
				createdAt: past(0),
			},
		];
	});

	await db.insert(message).values(messageRows);
	console.log(`   ✓ ${messageRows.length} messages created`);

	// ── Notifications ──────────────────────────────────────────────────────────
	console.log("🔔 Creating notifications...");

	await db.insert(notification).values([
		{
			id: createId(),
			userId: aliceId!,
			type: "NEW_NEARBY_LISTING" as const,
			title: "New item near you",
			body: "Ben just posted a box of books nearby!",
			read: false,
			data: { listingId: listingIds[1] },
		},
		{
			id: createId(),
			userId: benId!,
			type: "MESSAGE_RECEIVED" as const,
			title: "New message",
			body: "Alice sent you a message about the KALLAX shelf.",
			read: true,
			data: { fromUserId: aliceId },
		},
		{
			id: createId(),
			userId: chloeId!,
			type: "COMMENT_ON_LISTING" as const,
			title: "New comment on your listing",
			body: 'Someone commented: "Is this still available?"',
			read: false,
			data: { listingId: listingIds[2] },
		},
		{
			id: createId(),
			userId: davidId!,
			type: "LISTING_EXPIRED" as const,
			title: "Your listing expired",
			body: "Your 'Assorted picture frames' listing has expired.",
			read: false,
			data: { listingId: listingIds[9] },
		},
		{
			id: createId(),
			userId: sarahId!,
			type: "NEW_NEARBY_LISTING" as const,
			title: "New listing nearby",
			body: "Marcus just posted organic tomato starters near you!",
			read: false,
			data: { listingId: listingIds[12] },
		},
		{
			id: createId(),
			userId: daveId!,
			type: "MESSAGE_RECEIVED" as const,
			title: "New message",
			body: "Sarah sent you a message about the Power Drill.",
			read: false,
			data: { fromUserId: sarahId },
		},
	]);

	console.log("   ✓ 6 notifications created");

	// ── Reports ────────────────────────────────────────────────────────────────
	console.log("🚩 Creating reports...");

	await db.insert(report).values([
		{
			id: createId(),
			reason: "ALREADY_TAKEN" as const,
			details: "This item was picked up weeks ago, listing is still up.",
			reportedById: benId!,
			listingId: listingIds[5],
			resolved: false,
		},
		{
			id: createId(),
			reason: "SPAM" as const,
			details: "User is posting the same item repeatedly.",
			reportedById: chloeId!,
			reportedUserId: emmaId,
			resolved: true,
		},
	]);

	console.log("   ✓ 2 reports created");

	// ── Blocks ─────────────────────────────────────────────────────────────────
	console.log("🚫 Creating blocks...");

	await db.insert(block).values({
		id: createId(),
		blockerId: aliceId!,
		blockedId: davidId!,
	});

	console.log("   ✓ 1 block created");

	// ── Summary ────────────────────────────────────────────────────────────────
	console.log("\n✅ Seed complete!\n");
	console.log("Test accounts (password: password123):");
	for (const u of USERS) {
		console.log(`   ${u.email}`);
	}
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	});
