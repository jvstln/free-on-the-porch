import { env } from "@free-on-the-porch/env/private";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./schema/index.ts",
	extensionsFilters: ["postgis"],
	tablesFilter: ["!spatial_ref_sys", "!geography_columns", "!geometry_columns"],
	schemaFilter: ["!tiger", "!topology"],
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
