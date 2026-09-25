import type {
	ListingCategoryDto,
	ListingConditionDto,
	ListingStatusDto,
} from "@free-on-the-porch/shared/schemas";
import { formatDistanceToNowStrict } from "date-fns";
import {
	Armchair,
	BookOpen,
	Dumbbell,
	Gamepad2,
	Laptop,
	Package,
	Shirt,
	Sparkles,
	Sprout,
	UtensilsCrossed,
	Wrench,
} from "lucide-react-native";

// ─── Labels ───────────────────────────────────────────────────────────────────

export const CONDITION_LABEL: Record<ListingConditionDto, string> = {
	NEW: "New",
	LIKE_NEW: "Like new",
	GOOD: "Good",
	FAIR: "Fair",
	WORN: "Worn",
};

export const CATEGORY_LABEL: Record<ListingCategoryDto, string> = {
	FURNITURE: "Furniture",
	ELECTRONICS: "Electronics",
	CLOTHING: "Clothing",
	BOOKS: "Books",
	TOYS: "Toys",
	KITCHEN: "Kitchen",
	SPORTS: "Sports",
	TOOLS: "Tools",
	GARDEN: "Garden",
	OTHER: "Other",
};

export const CATEGORY_ICON = {
	ALL: Sparkles,
	FURNITURE: Armchair,
	ELECTRONICS: Laptop,
	CLOTHING: Shirt,
	BOOKS: BookOpen,
	TOYS: Gamepad2,
	KITCHEN: UtensilsCrossed,
	SPORTS: Dumbbell,
	TOOLS: Wrench,
	GARDEN: Sprout,
	OTHER: Package,
} as const;

export const STATUS_LABEL: Record<ListingStatusDto, string> = {
	AVAILABLE: "Available",
	RESERVED: "Reserved",
	PICKED_UP: "Picked Up (Claimed)",
	EXPIRED: "Expired",
	REMOVED: "Removed",
};

export const CATEGORY_MAP: Record<string, ListingCategoryDto | undefined> = {
	"All Items": undefined,
	Furniture: "FURNITURE",
	Electronics: "ELECTRONICS",
	Clothing: "CLOTHING",
	Books: "BOOKS",
	Toys: "TOYS",
	Kitchen: "KITCHEN",
	Sports: "SPORTS",
	Tools: "TOOLS",
	Plants: "GARDEN",
	Other: "OTHER",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDistance(meters?: number | null): string {
	if (meters == null) return "";
	if (meters < 1000) return `${Math.round(meters)}m away`;
	return `${(meters / 1000).toFixed(1)}km away`;
}

export function formatTimeAgo(dateString?: string | Date | null): string {
	if (!dateString) return "";
	try {
		const date =
			typeof dateString === "string" ? new Date(dateString) : dateString;
		if (Number.isNaN(date.getTime())) return "";
		return formatDistanceToNowStrict(date, { addSuffix: true });
	} catch {
		return "";
	}
}
