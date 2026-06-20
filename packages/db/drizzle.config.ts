import { env } from "@free-on-the-porch/env/server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./schema/index.ts",
	out: "./drizzle",
	casing: "snake_case",
	extensionsFilters: ["postgis"],
	// tablesFilter: ["!spatial_ref_sys", "!geography_columns", "!geometry_columns"],
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
