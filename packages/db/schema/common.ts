import { sql } from "drizzle-orm";
import { type PgColumn, timestamp } from "drizzle-orm/pg-core";

// Shared timestamp columns spread into every table. createdAt is set at
// insert time; updatedAt refreshes automatically on every UPDATE via
// $onUpdate (useful for ordering threads/messages by last activity).
export const timestamps = {
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
};

// Builds a `jsonb_build_object('field', value, ...)` SQL expression from a
// map of Drizzle columns. Used by raw SQL query shaping to construct a
// JSON object at the DB level (e.g. embedding a user sub-object into a
// message row without a separate round trip). The result is typed so the
// built object matches the shape given by `columns`.
export function toJsonbObject<T extends Record<PropertyKey, PgColumn>>(
	columns: T,
) {
	const chunks = Object.entries(columns).map(([field, column]) => {
		return sql`${field}::text, ${column}`;
	});

	return sql<{
		[K in keyof T]: T[K]["_"]["data"];
	}>`jsonb_build_object(${sql.join(chunks, sql`, `)})`;
}
