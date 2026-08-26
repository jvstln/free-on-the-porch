import { ThreadTypeSchema } from "@free-on-the-porch/shared/schemas";
import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	jsonb,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps } from "./common";
import { notificationTypeEnum, threadTypeEnum } from "./enums";
import { listing } from "./listing";

export const thread = pgTable(
	"thread",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		type: threadTypeEnum().notNull(),
		listingId: text().references(() => listing.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		index("thread_listingId_idx").on(table.listingId),
		// A thread can only have listingId and must have listingId if type is LISTING
		check(
			"thread_type_check",
			or(
				inArray(table.type, [ThreadTypeSchema.enum.DM]),
				and(
					eq(table.type, ThreadTypeSchema.enum.LISTING),
					isNotNull(table.listingId),
				),
			) ?? sql`false`,
		),
	],
);

export const threadMember = pgTable("thread_member", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	threadId: text()
		.notNull()
		.references(() => thread.id, { onDelete: "cascade" }),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	...timestamps,
});

export const message = pgTable(
	"message",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		body: varchar({ length: 1000 }).notNull(),
		read: boolean().default(false).notNull(),
		senderId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		threadId: text()
			.notNull()
			.references(() => thread.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		index("message_senderId_idx").on(table.senderId),
		index("message_threadId_idx").on(table.threadId),
	],
);

export const notification = pgTable(
	"notification",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		type: notificationTypeEnum().notNull(),
		title: varchar({ length: 100 }).notNull(),
		body: varchar({ length: 300 }).notNull(),
		read: boolean().default(false).notNull(),
		data: jsonb(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		index("notification_userId_read_idx").on(table.userId, table.read),
	],
);
