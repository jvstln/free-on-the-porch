import { sql } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core";

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

export const id = text().primaryKey().default(sql`gen_random_uuid()`);
