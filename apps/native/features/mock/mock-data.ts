import type { ListingCardItem } from "../listings/components/listing-card";

export const MOCK_USER = {
	id: "user-current",
	name: "Sarah Jenkins",
	email: "sarah@example.com",
	bio: "Sustainability advocate & wood crafting enthusiast. Decluttering one item at a time! 🌿",
	image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
	createdAt: "2026-03-12T14:32:00.000Z",
};

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Thread {
	id: string;
	otherUser: {
		id: string;
		name: string;
		image?: string | null;
		initials: string;
	};
	listing: {
		id: string;
		title: string;
		imageUrl?: string | null;
		status: "AVAILABLE" | "PICKED_UP" | "EXPIRED" | "REMOVED";
	};
	lastMessage: {
		body: string;
		createdAt: string;
		read: boolean;
		isMe: boolean;
	};
	unreadCount: number;
}

export interface ThreadDetails {
	id: string;
	otherUser: {
		name: string;
		image?: string | null;
		initials: string;
	};
	listing: {
		id: string;
		title: string;
		imageUrl?: string | null;
		status: "AVAILABLE" | "PICKED_UP";
		condition: string;
	};
}

export interface Message {
	id: string;
	body: string;
	createdAt: string;
	isMe: boolean;
	read: boolean;
	senderId?: string;
	receiverId?: string;
}

// ─── Explore Listings Mock Data ───────────────────────────────────────────────

export const MOCK_LISTINGS: ListingCardItem[] = [
	{
		id: "listing-table",
		title: "Vintage Oak Coffee Table",
		category: "FURNITURE",
		condition: "GOOD",
		status: "AVAILABLE",
		address: "Maplewood Terrace",
		distanceMeters: 450,
		images: [
			{
				url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400",
			},
		],
		user: {
			name: "Sarah Jenkins",
			image:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
		},
		createdAt: new Date(Date.now() - 600000).toISOString(),
	},
	{
		id: "listing-drill",
		title: "Bosch Power Drill",
		category: "TOOLS",
		condition: "LIKE_NEW",
		status: "AVAILABLE",
		address: "Valley Street",
		distanceMeters: 1200,
		images: [
			{
				url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
			},
		],
		user: {
			name: "Dave Miller",
			image:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
		},
		createdAt: new Date(Date.now() - 7200000).toISOString(),
	},
	{
		id: "listing-crib",
		title: "Baby Crib & Mattress",
		category: "TOYS",
		condition: "GOOD",
		status: "PICKED_UP",
		address: "Elm Road",
		distanceMeters: 2300,
		images: [
			{
				url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400",
			},
		],
		user: {
			name: "Emma Watson",
			image:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
		},
		createdAt: new Date(Date.now() - 86400000).toISOString(),
	},
	{
		id: "listing-tomato",
		title: "Organic Tomato Starters",
		category: "GARDEN",
		condition: "NEW",
		status: "AVAILABLE",
		address: "Baker Street",
		distanceMeters: 800,
		images: [
			{
				url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400",
			},
		],
		user: {
			name: "Marcus Chen",
			image:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
		},
		createdAt: new Date(Date.now() - 259200000).toISOString(),
	},
	{
		id: "listing-books",
		title: "Stephen King Hardcover Set",
		category: "BOOKS",
		condition: "GOOD",
		status: "AVAILABLE",
		address: "Jefferson Ave",
		distanceMeters: 3100,
		images: [
			{
				url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
			},
		],
		user: { name: "Alice Brown", image: null },
		createdAt: new Date(Date.now() - 120000).toISOString(),
	},
	{
		id: "listing-blender",
		title: "Ninja High-Speed Blender",
		category: "KITCHEN",
		condition: "FAIR",
		status: "AVAILABLE",
		address: "Crestwood Ave",
		distanceMeters: 1900,
		images: [
			{
				url: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400",
			},
		],
		user: { name: "John Doe", image: null },
		createdAt: new Date(Date.now() - 3600000).toISOString(),
	},
	{
		id: "listing-headphones",
		title: "Sony Noise Cancelling Headphones",
		category: "ELECTRONICS",
		condition: "WORN",
		status: "AVAILABLE",
		address: "Prospect Street",
		distanceMeters: 4500,
		images: [
			{
				url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
			},
		],
		user: { name: "Chris Evans", image: null },
		createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
	},
	{
		id: "listing-jacket",
		title: "Levi's Denim Jacket (Medium)",
		category: "CLOTHING",
		condition: "LIKE_NEW",
		status: "AVAILABLE",
		address: "Oakwood Drive",
		distanceMeters: 1500,
		images: [
			{
				url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
			},
		],
		user: {
			name: "Sarah Jenkins",
			image:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
		},
		createdAt: new Date(Date.now() - 300000).toISOString(),
	},
];

// ─── Messaging Inbox Mock Data ────────────────────────────────────────────────

export const INITIAL_THREADS: Thread[] = [
	{
		id: "thread-1",
		otherUser: {
			id: "user-sarah",
			name: "Sarah Jenkins",
			image:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
			initials: "SJ",
		},
		listing: {
			id: "listing-table",
			title: "Vintage Oak Coffee Table",
			imageUrl:
				"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=150",
			status: "AVAILABLE",
		},
		lastMessage: {
			body: "Is this still available for pickup tonight? I can come by in a truck around 6 PM.",
			createdAt: "10m ago",
			read: false,
			isMe: false,
		},
		unreadCount: 1,
	},
	{
		id: "thread-2",
		otherUser: {
			id: "user-dave",
			name: "Dave Miller",
			image:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
			initials: "DM",
		},
		listing: {
			id: "listing-drill",
			title: "Bosch Power Drill",
			imageUrl:
				"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=150",
			status: "AVAILABLE",
		},
		lastMessage: {
			body: "I left the charger in the box on the porch. Let me know if you found it okay!",
			createdAt: "2h ago",
			read: true,
			isMe: true,
		},
		unreadCount: 0,
	},
	{
		id: "thread-3",
		otherUser: {
			id: "user-emma",
			name: "Emma Watson",
			image:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
			initials: "EW",
		},
		listing: {
			id: "listing-crib",
			title: "Baby Crib & Mattress",
			imageUrl:
				"https://images.unsplash.com/photo-1544816155-12df9643f363?w=150",
			status: "PICKED_UP",
		},
		lastMessage: {
			body: "Thank you so much! It fits perfectly in my car and my baby loves it.",
			createdAt: "Yesterday",
			read: true,
			isMe: false,
		},
		unreadCount: 0,
	},
	{
		id: "thread-4",
		otherUser: {
			id: "user-marcus",
			name: "Marcus Chen",
			image:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
			initials: "MC",
		},
		listing: {
			id: "listing-tomato",
			title: "Organic Tomato Starters",
			imageUrl:
				"https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=150",
			status: "AVAILABLE",
		},
		lastMessage: {
			body: "They are on the driveway right next to the garage. Feel free to grab as many as you need!",
			createdAt: "3d ago",
			read: true,
			isMe: false,
		},
		unreadCount: 0,
	},
];

// ─── Messaging Thread Details Mock Data ───────────────────────────────────────

export const THREADS_DETAILS: Record<string, ThreadDetails> = {
	"thread-1": {
		id: "thread-1",
		otherUser: {
			name: "Sarah Jenkins",
			image:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
			initials: "SJ",
		},
		listing: {
			id: "listing-table",
			title: "Vintage Oak Coffee Table",
			imageUrl:
				"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=150",
			status: "AVAILABLE",
			condition: "Good",
		},
	},
	"thread-2": {
		id: "thread-2",
		otherUser: {
			name: "Dave Miller",
			image:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
			initials: "DM",
		},
		listing: {
			id: "listing-drill",
			title: "Bosch Power Drill",
			imageUrl:
				"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=150",
			status: "AVAILABLE",
			condition: "Like New",
		},
	},
	"thread-3": {
		id: "thread-3",
		otherUser: {
			name: "Emma Watson",
			image:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
			initials: "EW",
		},
		listing: {
			id: "listing-crib",
			title: "Baby Crib & Mattress",
			imageUrl:
				"https://images.unsplash.com/photo-1544816155-12df9643f363?w=150",
			status: "PICKED_UP",
			condition: "Good",
		},
	},
	"thread-4": {
		id: "thread-4",
		otherUser: {
			name: "Marcus Chen",
			image:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
			initials: "MC",
		},
		listing: {
			id: "listing-tomato",
			title: "Organic Tomato Starters",
			imageUrl:
				"https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=150",
			status: "AVAILABLE",
			condition: "New",
		},
	},
};

export const INITIAL_MESSAGES: Record<string, Message[]> = {
	"thread-1": [
		{
			id: "m1",
			body: "Hi! I saw your post for the vintage coffee table.",
			createdAt: "4:15 PM",
			isMe: false,
			read: true,
		},
		{
			id: "m2",
			body: "Hey there! Yes, it's still sitting on the porch.",
			createdAt: "4:20 PM",
			isMe: true,
			read: true,
		},
		{
			id: "m3",
			body: "Is this still available for pickup tonight? I can come by in a truck around 6 PM.",
			createdAt: "4:30 PM",
			isMe: false,
			read: true,
		},
	],
	"thread-2": [
		{
			id: "m1",
			body: "Hey Dave, is the power drill still available?",
			createdAt: "Yesterday",
			isMe: true,
			read: true,
		},
		{
			id: "m2",
			body: "Yes it is! I just placed it outside on the workbench by the driveway.",
			createdAt: "Yesterday",
			isMe: false,
			read: true,
		},
		{
			id: "m3",
			body: "Awesome, grabbing it now.",
			createdAt: "Yesterday",
			isMe: true,
			read: true,
		},
		{
			id: "m4",
			body: "I left the charger in the box on the porch. Let me know if you found it okay!",
			createdAt: "Yesterday",
			isMe: false,
			read: true,
		},
	],
	"thread-3": [
		{
			id: "m1",
			body: "Hello Emma, I can pick up the baby crib today if it's available.",
			createdAt: "2 days ago",
			isMe: true,
			read: true,
		},
		{
			id: "m2",
			body: "Sure! Let know when you arrive.",
			createdAt: "2 days ago",
			isMe: false,
			read: true,
		},
		{
			id: "m3",
			body: "Thank you so much! It fits perfectly in my car and my baby loves it.",
			createdAt: "2 days ago",
			isMe: false,
			read: true,
		},
	],
	"thread-4": [
		{
			id: "m1",
			body: "Hi Marcus, are the tomato starters still out?",
			createdAt: "3 days ago",
			isMe: true,
			read: true,
		},
		{
			id: "m2",
			body: "They are on the driveway right next to the garage. Feel free to grab as many as you need!",
			createdAt: "3 days ago",
			isMe: false,
			read: true,
		},
	],
};

export const AUTO_REPLIES = [
	"Perfect! I'll leave it out for you.",
	"Sounds like a plan. Let me know when you pick it up so I can update the post status.",
	"Great! Drive safe, neighborhood streets get a bit crowded around this time.",
	"Awesome, it's all yours! See you soon.",
];
