// Auth tables managed by better-auth via the Drizzle adapter. The column
// shapes follow better-auth's expected schema so the `@better-auth/drizzle-adapter`
// can read/write them directly. `user` also carries domain fields (bio) used
// by the rest of the app.
import { PublicUserSchema } from "@free-on-the-porch/shared/schemas";
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

// --- Public user field whitelist -------------------------------------------
// Derived programmatically from the shared PublicUserSchema at import time.
// publicUserSelectFields is a Drizzle column-selection object ({ field: true })
// passed to relational queries to restrict to only public-safe fields. Feature
// code MUST use it (never `.columns: { ... }` the whole user table) so internal
// fields (emailVerified, etc.) never leak. Keeping it derived from
// PublicUserSchema guarantees it stays in sync with the API contract.
export const publicUserSelectFields = Object.fromEntries(
	PublicUserSchema.keyof().options.map((field) => [field, true]),
) as Record<keyof typeof PublicUserSchema.shape, true>;
