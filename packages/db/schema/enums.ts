import {
	LISTING_CATEGORY,
	LISTING_CONDITION,
	LISTING_STATUS,
	NOTIFICATION_TYPE,
	REPORT_REASON,
	THREAD_TYPE,
} from "@free-on-the-porch/shared/schemas";
import { pgEnum } from "drizzle-orm/pg-core";

export const listingCategoryEnum = pgEnum("listing_category", LISTING_CATEGORY);

export const listingConditionEnum = pgEnum(
	"listing_condition",
	LISTING_CONDITION,
);

export const listingStatusEnum = pgEnum("listing_status", LISTING_STATUS);

export const notificationTypeEnum = pgEnum(
	"notification_type",
	NOTIFICATION_TYPE,
);

export const reportReasonEnum = pgEnum("report_reason", REPORT_REASON);

export const threadTypeEnum = pgEnum("thread_type", THREAD_TYPE);
