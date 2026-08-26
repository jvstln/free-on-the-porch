import { sql } from "drizzle-orm";
import { type PgColumn, timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
};

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
