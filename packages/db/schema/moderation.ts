// Moderation domain: user/listing reports and mutual blocks.
// `report` can target a user, a listing, or both (the optional FKs use
// `onDelete: "set null"` so reports survive the deletion of their target).

import { isNull, ne, or, sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { id, timestamps } from "./common";
import { reportReasonEnum } from "./enums";
import { listing } from "./listing";

export const report = pgTable(
	"report",
	{
		id,
		reason: reportReasonEnum().notNull(),
		details: varchar({ length: 300 }),
		resolved: boolean().default(false).notNull(),
		reportedById: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reportedUserId: text().references(() => user.id, { onDelete: "set null" }),
		listingId: text().references(() => listing.id, { onDelete: "set null" }),
		...timestamps,
	},
	(table) => [
		// Lookup paths: everything reported by a user, everything reported
		// against a user, everything reported for a listing.
		index("report_reportedById_idx").on(table.reportedById),
		index("report_reportedUserId_idx").on(table.reportedUserId),
		index("report_listingId_idx").on(table.listingId),
		// A user cannot report themselves (when the target is another user).
		check(
			"report_reportedById_ne_reportedUserId",
			or(
				isNull(table.reportedUserId),
				ne(table.reportedById, table.reportedUserId),
			) ?? sql`false`,
		),
	],
);

// Unique (blockerId, blockedId) prevents duplicate/reverse blocks and keeps
// the block relation unambiguous.
export const block = pgTable(
	"block",
	{
		id,
		blockerId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		blockedId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		// Unique (blockerId, blockedId) prevents duplicate/reverse blocks and
		// keeps the block relation unambiguous. Its leftmost column also backs
		// "what has this user blocked" lookups; the reverse lookup ("who blocked
		// me", used to filter feed/inbox rows) needs its own index on blockedId.
		uniqueIndex("block_blockerId_blockedId_key").on(
			table.blockerId,
			table.blockedId,
		),
		index("block_blockedId_idx").on(table.blockedId),
	],
);
