import { PublicUserSchema } from "@free-on-the-porch/shared/schemas";
import { getColumns } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

export const user = pgTable("user", {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	bio: text(),
	...timestamps,
});

export const session = pgTable(
	"session",
	{
		id: text().primaryKey(),
		expiresAt: timestamp({ mode: "date" }).notNull(),
		token: text().notNull().unique(),
		ipAddress: text(),
		userAgent: text(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text().primaryKey(),
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: timestamp({ mode: "date" }),
		refreshTokenExpiresAt: timestamp({ mode: "date" }),
		scope: text(),
		password: text(),
		...timestamps,
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text().primaryKey(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp({ mode: "date" }).notNull(),
		...timestamps,
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

const userColumns = getColumns(user);
const publicUserColumnsEntries = PublicUserSchema.keyof().options.map(
	(field) => [field, userColumns[field]],
);

export const publicUserSelectFields = Object.fromEntries(
	publicUserColumnsEntries.map(([field]) => [field, true]),
) as Record<keyof typeof PublicUserSchema.shape, true>;

export const publicUserColumns = Object.fromEntries(
	publicUserColumnsEntries,
) as Pick<
	ReturnType<typeof getColumns<typeof user>>,
	keyof typeof PublicUserSchema.shape
>;
