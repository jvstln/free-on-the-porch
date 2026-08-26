import z from "zod";

export const LISTING_STATUS = [
	"AVAILABLE",
	"RESERVED",
	"PICKED_UP",
	"EXPIRED",
	"REMOVED",
] as const;

export const ListingStatusSchema = z.enum(LISTING_STATUS);
export type ListingStatusDto = z.infer<typeof ListingStatusSchema>;

export const LISTING_CATEGORY = [
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
] as const;

export const ListingCategorySchema = z.enum(LISTING_CATEGORY);
export type ListingCategoryDto = z.infer<typeof ListingCategorySchema>;

export const LISTING_CONDITION = [
	"NEW",
	"LIKE_NEW",
	"GOOD",
	"FAIR",
	"WORN",
] as const;

export const ListingConditionSchema = z.enum(LISTING_CONDITION);
export type ListingConditionDto = z.infer<typeof ListingConditionSchema>;

export const NOTIFICATION_TYPE = [
	"NEW_NEARBY_LISTING",
	"MESSAGE_RECEIVED",
	"COMMENT_ON_LISTING",
	"LISTING_EXPIRED",
] as const;

export const NotificationTypeSchema = z.enum(NOTIFICATION_TYPE);
export type NotificationTypeDto = z.infer<typeof NotificationTypeSchema>;

export const REPORT_REASON = [
	"SPAM",
	"INAPPROPRIATE",
	"ALREADY_TAKEN",
	"FAKE",
	"OTHER",
] as const;

export const ReportReasonSchema = z.enum(REPORT_REASON);
export type ReportReasonDto = z.infer<typeof ReportReasonSchema>;

export const THREAD_TYPE = ["DM", "LISTING"] as const;

export const ThreadTypeSchema = z.enum(THREAD_TYPE);
export type ThreadTypeDto = z.infer<typeof ThreadTypeSchema>;
