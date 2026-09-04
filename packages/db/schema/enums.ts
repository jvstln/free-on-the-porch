// PostgreSQL enum definitions.
//
// IMPORTANT — single source of truth: the enum VALUE LISTS come from
// `@free-on-the-porch/shared/schemas` (as `as const` arrays), NOT from here.
// This keeps the DB enum values in lockstep with the Zod schemas and the API
// contract. When adding/changing an enum value, edit the corresponding array
// in `packages/shared/schemas/enum.schema.ts`, then generate a migration.
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
