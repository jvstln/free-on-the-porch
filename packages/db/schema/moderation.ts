// Moderation domain: user/listing reports and mutual blocks.
// `report` can target a user, a listing, or both (the optional FKs use
// `onDelete: "set null"` so reports survive the deletion of their target).
import {
	boolean,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps } from "./common";
import { reportReasonEnum } from "./enums";
import { listing } from "./listing";

export const report = pgTable("report", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	reason: reportReasonEnum().notNull(),
	details: varchar({ length: 300 }),
	resolved: boolean().default(false).notNull(),
	reportedById: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	reportedUserId: text().references(() => user.id, { onDelete: "set null" }),
	listingId: text().references(() => listing.id, { onDelete: "set null" }),
	...timestamps,
});

// Unique (blockerId, blockedId) prevents duplicate/reverse blocks and keeps
// the block relation unambiguous.
export const block = pgTable(
	"block",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		blockerId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		blockedId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		uniqueIndex("block_blockerId_blockedId_key").on(
			table.blockerId,
			table.blockedId,
		),
	],
);
