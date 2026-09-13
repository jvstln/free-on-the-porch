# @free-on-the-porch/db

Drizzle ORM database layer for the Free on the Porch monorepo. Contains the schema definitions, the Drizzle client, relational query definitions, and seed data.

## Package Overview

| Export | Path | Purpose |
|--------|------|---------|
| `@free-on-the-porch/db` | `./index.ts` | Drizzle client instance + all schema re-exports |
| `@free-on-the-porch/db/schema` | `./schema/index.ts` | Schema tables, enums, relations (no client) |

## How the Client Works

The Drizzle client is created in `index.ts`:

```ts
import { env } from "@free-on-the-porch/env/private";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./schema/relations";

export const db = drizzle({
  connection: env.DATABASE_URL,
  relations,
});

export * from "./schema";
export * from "./schema/common";
```

- The client connects via `env.DATABASE_URL` (loaded from root `.env` via `@free-on-the-porch/env`).
- The `relations` object enables the **relational query API** (`db.query.<table>.findFirst/findMany` with `with:` / `columns:` clauses).
- The client re-exports all schema modules so consumers can import tables and the client from a single path.

> **Server-side note**: Feature code in `apps/server` should inject `DrizzleService` (wrapping this client) rather than importing `db` directly.

## Schema Structure

The schema is split by domain under `schema/`:

| File | Tables | Purpose |
|------|--------|---------|
| `auth.ts` | `user`, `session`, `account`, `verification` | Better Auth tables |
| `listing.ts` | `listing`, `listing_claim_request`, `listing_image`, `comment` | Listing domain with PostGIS geography |
| `messaging.ts` | `thread`, `thread_member`, `message`, `notification` | Messaging domain |
| `moderation.ts` | `report`, `block` | Moderation domain |
| `enums.ts` | — | PostgreSQL enum definitions |
| `common.ts` | — | Shared column helpers (`timestamps`, `toJsonbObject`) |
| `relations.ts` | — | Drizzle relational query definitions |

### 14 tables total

| Domain | Tables |
|--------|--------|
| Auth | `user`, `session`, `account`, `verification` |
| Listing | `listing`, `listing_claim_request`, `listing_image`, `comment` |
| Messaging | `thread`, `thread_member`, `message`, `notification` |
| Moderation | `report`, `block` |

### Conventions

- **Primary keys**: `text().primaryKey().$defaultFn(() => crypto.randomUUID())` — all tables use UUID text PKs with client-side generation.
- **Timestamps**: every table spreads `...timestamps` from `common.ts` (`createdAt` defaultNow, `updatedAt` auto-updates).
- **Foreign keys**: declared with explicit `onDelete` (mostly `"cascade"`, with `"set null"` on `report`'s optional targets).

## Key Architectural Patterns

### 1. Enum pipeline (single source of truth)

PostgreSQL enum values are **not** hardcoded in the db package. They're defined as `as const` arrays in `@free-on-the-porch/shared/schemas`, imported into `schema/enums.ts`, and mapped to `pgEnum`:

```ts
import { LISTING_STATUS } from "@free-on-the-porch/shared/schemas";
import { pgEnum } from "drizzle-orm/pg-core";

export const listingStatusEnum = pgEnum("listing_status", LISTING_STATUS);
```

This keeps the DB enum values in sync with Zod validation schemas and the API contract. When you add or change an enum value, update `packages/shared/schemas/enum.schema.ts` (Screaming snake case), and it flows to the DB.

### 2. PostGIS geography (in `listing.ts`)

The `geographyPoint` custom type maps a JS `{ lat, lng }` object to a PostGIS `geography(Point, 4326)` column:

- **`toDriver`** serializes to WKT (`SRID=4326;POINT(lng lat)`).
- **`fromDriver`** handles both EWKB hex binary parsing and WKT text fallback.

This is what enables geospatial queries using raw `sql` with `ST_DWithin`, `ST_Distance`, `<->` operators (see the listing service's `findFeed`).

### 3. Public user field protection (in `auth.ts`)

`publicUserSelectFields` and `publicUserColumns` are derived programmatically from `PublicUserSchema.keyof()` in the shared package. This ensures the list of safe-to-expose user fields stays in sync with the API contract — feature code must use these to avoid leaking full user rows.

## Database Commands

All commands run against the root `.env` (via `packages/env` import side effect).

```bash
pnpm db:init        # CREATE EXTENSION postgis (needed after fresh compose up)
pnpm db:push        # Push Drizzle schema to DB (drizzle-kit push)
pnpm db:generate    # Generate a new migration (drizzle-kit generate)
pnpm db:migrate     # Apply migrations (drizzle-kit migrate)
pnpm db:seed        # Seed the database (tsx --env-file=../../.env ./seed/index.ts)
```

Drizzle Kit config lives in `drizzle.config.ts` — it filters out PostGIS system tables (`spatial_ref_sys`, `geography_columns`, `geometry_columns`) and schemas (`tiger`, `topology`).

## Seeding

The seed system is a deterministic data generator that produces test data across all domains. See `seed/index.ts` for the orchestrator, which:

1. **Cleans** the database (deletes all rows in dependency order — blocks first, users last).
2. **Seeds** in order: users → listings → comments → messaging → notifications → moderation.

Run with `pnpm db:seed`. Test account password is `Pass@123` (except the "Test User" with a pre-hashed password).
