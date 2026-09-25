import { env } from "@free-on-the-porch/env/private";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./schema/relations";

export const db = drizzle({
	connection: env.DATABASE_URL,
	relations,
});

export * from "./schema";
