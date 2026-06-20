import { db as drizzleDb } from "@free-on-the-porch/db";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DrizzleService {
	readonly db: typeof drizzleDb = drizzleDb;
}
