import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { account, user } from "../schema";
import { createId } from "./utils.seed";

export const SEED_USERS = [
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
	{
		name: "Test User",
		email: "test@gmail.com",
		bio: "Test account for manual verification.",
		image: "https://i.pravatar.cc/150?img=33",
	},
] as const;

export type SeededUser = typeof user.$inferSelect;

export async function seedUsers(db: NodePgDatabase<any>) {
	console.log("👤 Creating users...");

	const defaultPassword = "Pass@123";
	const userRecords = SEED_USERS.map((u) => {
		const id = createId();
		return {
			id,
			name: u.name,
			email: u.email,
			emailVerified: true,
			image: u.image,
			bio: u.bio,
		};
	});

	await db.insert(user).values(userRecords);

	await db.insert(account).values(
		userRecords.map((u) => ({
			id: createId(),
			accountId: u.id,
			providerId: "credential",
			userId: u.id,
			password:
				u.email === "test@gmail.com"
					? "11c4e782989c012cb3398fbf16c5068d:8bbc4d0293406d1b646a99ee1392718c9e8badb6c7ea4b2f72ef6ac32fe48eaab3593f53f2ec26d7dc4a7b787b48d1d4aeeab8471743d453d0dd28c7f26ae5cc"
					: defaultPassword,
		})),
	);

	console.log(`   ✓ ${userRecords.length} users and accounts created`);

	// Create a handy mapping of email -> user record
	const usersMap = {} as Record<string, SeededUser>;
	for (const u of userRecords) {
		usersMap[u.email] = {
			...u,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}

	return usersMap;
}
