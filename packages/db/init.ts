import { sql } from "drizzle-orm";
import { db } from "./index";

async function init() {
	console.log("⚙️  Ensuring PostGIS extension is enabled...");
	await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis;`);
	console.log("✅ PostGIS extension ready.");
}

init()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("❌ Failed to initialize PostGIS:", err);
		process.exit(1);
	});
