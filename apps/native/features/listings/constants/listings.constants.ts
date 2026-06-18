import type {
	ListingCategoryType,
	ListingConditionType,
} from "@free-on-the-porch/shared/schemas";

// ─── Location ─────────────────────────────────────────────────────────────────

export const DEFAULT_LOCATION = "Maplewood";

export const DEFAULT_COORDS = {
	lat: 40.7312,
	lng: -74.2738,
};

// ─── Labels ───────────────────────────────────────────────────────────────────

export const CONDITION_LABEL: Record<ListingConditionType, string> = {
	NEW: "New",
	LIKE_NEW: "Like new",
	GOOD: "Good",
	FAIR: "Fair",
	WORN: "Worn",
};

export const CATEGORY_LABEL: Record<ListingCategoryType, string> = {
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

// ─── Filter Config ────────────────────────────────────────────────────────────

export const CATEGORIES = [
	"All Items",
	"Furniture",
	"Electronics",
	"Clothing",
	"Books",
	"Toys",
	"Kitchen",
	"Sports",
	"Tools",
	"Plants",
	"Other",
] as const;

export type CategoryLabel = (typeof CATEGORIES)[number];

export const CATEGORY_MAP: Record<string, ListingCategoryType | undefined> = {
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
