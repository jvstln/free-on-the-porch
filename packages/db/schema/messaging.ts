// Messaging domain: conversation threads, their members, individual messages,
// and push-style notifications. A thread is either a DM (no listing) or a
// LISTING conversation (tied to a specific listing), enforced by the CHECK
// constraint below. `notification` is a per-user inbox for system events.
import { ThreadTypeSchema } from "@free-on-the-porch/shared/schemas";
import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	jsonb,
	pgTable,
	text,
	uniqueIndex,
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
		// CHECK invariant: a LISTING thread must reference a listing; a DM
		// thread must NOT. Prevents orphaned/ambiguous conversations.
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

export const threadMember = pgTable(
	"thread_member",
	{
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
	},
	(table) => [
		// A user appears at most once per thread; unique guard prevents
		// duplicate member rows from any double-insert.
		uniqueIndex("thread_member_thread_user_key").on(
			table.threadId,
			table.userId,
		),
		// Backs "find all threads a user belongs to" (DM/listings inbox).
		index("thread_member_userId_idx").on(table.userId),
	],
);

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
