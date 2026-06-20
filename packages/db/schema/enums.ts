import { pgEnum } from "drizzle-orm/pg-core";

export const listingCategoryEnum = pgEnum("listing_category", [
	"FURNITURE",
	"ELECTRONICS",
	"CLOTHING",
	"BOOKS",
	"TOYS",
	"KITCHEN",
	"SPORTS",
	"TOOLS",
	"GARDEN",
	"OTHER",
]);

export const listingConditionEnum = pgEnum("listing_condition", [
	"NEW",
	"LIKE_NEW",
	"GOOD",
	"FAIR",
	"WORN",
]);

export const listingStatusEnum = pgEnum("listing_status", [
	"AVAILABLE",
	"PICKED_UP",
	"EXPIRED",
	"REMOVED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"NEW_NEARBY_LISTING",
	"MESSAGE_RECEIVED",
	"COMMENT_ON_LISTING",
	"LISTING_EXPIRED",
]);

export const reportReasonEnum = pgEnum("report_reason", [
	"SPAM",
	"INAPPROPRIATE",
	"ALREADY_TAKEN",
	"FAKE",
	"OTHER",
]);
