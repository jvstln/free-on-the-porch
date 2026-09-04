import { db as drizzleDb } from "@free-on-the-porch/db";
import { Injectable } from "@nestjs/common";

// The ONE sanctioned way feature code accesses the database. Feature services
// inject DrizzleService and read `this.drizzle.db` — they must NOT import the
// raw `db` export from @free-on-the-porch/db directly.
// `db` is the Drizzle client created in the db package (relational queries,
// transactions, raw SQL etc. all flow through it).
@Injectable()
export class DrizzleService {
	readonly db: typeof drizzleDb = drizzleDb;
}
