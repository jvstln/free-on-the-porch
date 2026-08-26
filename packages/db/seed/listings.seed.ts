import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { listing, listingClaimRequest, listingImage } from "../schema";
import type { SeededUser } from "./users.seed";
import {
	BASE_LAT,
	BASE_LNG,
	createId,
	future,
	jitter,
	past,
} from "./utils.seed";

export const SEED_LISTINGS = [
	{
		title: "IKEA KALLAX shelf unit",
		description:
			"White 4x4 KALLAX, good condition. A few scuffs on the base but fully functional. You collect.",
		category: "FURNITURE" as const,
		condition: "GOOD" as const,
		status: "AVAILABLE" as const,
		address: "14 Spring Grove Rd, Hounslow",
		ownerEmail: "alice@example.com",
		images: [
			"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
			"https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600",
		],
		claimRequests: ["test@gmail.com"], // Test user requested to claim this
	},
	{
		title: "Box of paperback novels",
		description:
			"Around 20 mixed fiction paperbacks — thrillers, romance, a bit of sci-fi. Take some or all.",
		category: "BOOKS" as const,
		condition: "FAIR" as const,
		status: "RESERVED" as const, // Reserved for test user
		address: "3 Bath Rd, Hounslow",
		ownerEmail: "ben@example.com",
		claimedByEmail: "test@gmail.com",
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
		ownerEmail: "chloe@example.com",
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
		ownerEmail: "david@example.com",
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
		ownerEmail: "emma@example.com",
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
		ownerEmail: "sarah@example.com",
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
		ownerEmail: "marcus@example.com",
		claimedByEmail: "sarah@example.com",
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
		ownerEmail: "dave@example.com",
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
		ownerEmail: "dave@example.com",
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
		ownerEmail: "test@gmail.com", // Test user owned expired listing
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
		ownerEmail: "alice@example.com",
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
		status: "PICKED_UP" as const, // Claimed listing owned by Test User
		address: "Elm Road",
		ownerEmail: "test@gmail.com",
		claimedByEmail: "alice@example.com",
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
		ownerEmail: "marcus@example.com",
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
		status: "AVAILABLE" as const, // Available listing owned by Test User
		address: "Jefferson Ave",
		ownerEmail: "test@gmail.com",
		images: [
			"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
		],
		claimRequests: ["alice@example.com", "ben@example.com"], // Other users requested this
	},
	{
		title: "Ninja High-Speed Blender",
		description:
			"Ninja blender in fair condition. Works well, some cosmetic wear on the base.",
		category: "KITCHEN" as const,
		condition: "FAIR" as const,
		status: "AVAILABLE" as const,
		address: "Crestwood Ave",
		ownerEmail: "chloe@example.com",
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
		ownerEmail: "david@example.com",
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
		ownerEmail: "emma@example.com",
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
		ownerEmail: "dave@example.com",
		images: [
			"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",
		],
	},
] as const;

export type SeededListing = typeof listing.$inferSelect;

export async function seedListings(
	db: NodePgDatabase<any>,
	users: Record<string, SeededUser>,
) {
	console.log("📦 Creating listings...");

	const listingRecords = [] as Array<SeededListing>;
	const imagesToInsert = [] as Array<typeof listingImage.$inferInsert>;
	const claimRequestsToInsert = [] as Array<
		typeof listingClaimRequest.$inferInsert
	>;

	for (const sl of SEED_LISTINGS) {
		const id = createId();
		const owner = users[sl.ownerEmail];
		if (!owner) continue;

		const claimedByUser =
			"claimedByEmail" in sl && sl.claimedByEmail
				? users[sl.claimedByEmail]
				: null;

		const record: SeededListing = {
			id,
			title: sl.title,
			description: sl.description,
			category: sl.category,
			condition: sl.condition,
			status: sl.status,
			location: { lat: jitter(BASE_LAT), lng: jitter(BASE_LNG) },
			address: sl.address,
			expiresAt: sl.status === "EXPIRED" ? past(2) : future(7),
			userId: owner.id,
			claimedByUserId: claimedByUser ? claimedByUser.id : null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		listingRecords.push(record);

		// Prepare images
		for (let order = 0; order < sl.images.length; order++) {
			imagesToInsert.push({
				id: createId(),
				url: sl.images[order]!,
				order,
				listingId: id,
			});
		}

		// Prepare claims if any
		if ("claimRequests" in sl && sl.claimRequests) {
			for (const requesterEmail of sl.claimRequests) {
				const requester = users[requesterEmail];
				if (requester) {
					claimRequestsToInsert.push({
						id: createId(),
						listingId: id,
						userId: requester.id,
					});
				}
			}
		}
	}

	await db.insert(listing).values(listingRecords);
	if (imagesToInsert.length > 0) {
		await db.insert(listingImage).values(imagesToInsert);
	}
	if (claimRequestsToInsert.length > 0) {
		await db.insert(listingClaimRequest).values(claimRequestsToInsert);
	}

	console.log(
		`   ✓ ${listingRecords.length} listings, ${imagesToInsert.length} images, and ${claimRequestsToInsert.length} claim requests created`,
	);

	// Create a handy mapping of title -> listing record
	const listingsMap = {} as Record<string, SeededListing>;
	for (const l of listingRecords) {
		listingsMap[l.title] = l;
	}

	return listingsMap;
}
