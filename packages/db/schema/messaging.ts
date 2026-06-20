import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps } from "./common";
import { notificationTypeEnum } from "./enums";
import { listing } from "./listing";

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
		receiverId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		listingId: text().references(() => listing.id, { onDelete: "set null" }),
		...timestamps,
	},
	(table) => [
		index("message_senderId_receiverId_idx").on(
			table.senderId,
			table.receiverId,
		),
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
