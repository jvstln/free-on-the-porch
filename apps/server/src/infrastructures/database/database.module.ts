import { Global, Module } from "@nestjs/common";
import { DrizzleService } from "./database.service";

// Global provider so any module can inject DrizzleService without importing
// DatabaseModule explicitly. Wraps the shared Drizzle client.
@Global()
@Module({
	providers: [DrizzleService],
	exports: [DrizzleService],
})
export class DatabaseModule {}
