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
