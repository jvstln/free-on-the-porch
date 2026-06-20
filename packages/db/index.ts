import { env } from "@free-on-the-porch/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle({
	connection: env.DATABASE_URL,
	casing: "snake_case",
	schema,
});

export * from "./schema";
