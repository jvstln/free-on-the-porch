# AGENTS.md

## Stack reality check

- pnpm + Turborepo monorepo. Backend: **NestJS 11** (`apps/server`). ORM: **Drizzle ORM** (on `rc` — uses the new API: unnamed column builders, object-style `where`, `RAW` escape hatch). `bts.jsonc` only records the original scaffold command; the stack has diverged since.
- Mobile: Expo SDK ~55, Expo Router, React 19, HeroUI Native + Uniwind (Tailwind v4), TanStack Query + Zustand.
- DB: PostgreSQL with **PostGIS** (`postgis/postgis:18-3.6` via `docker compose up -d db`). Port comes from `.env` `DATABASE_PORT` (currently 5433).
- Shared dependency versions are pinned via pnpm catalogs in `pnpm-workspace.yaml`.
- Package names use "porch" even though the repo is named "free-on-the-pouch": `@free-on-the-porch/db`, `@free-on-the-porch/env`, `@free-on-the-porch/shared`.

## Commands

```bash
pnpm install
docker compose up -d db      # Postgres+PostGIS
pnpm db:init                 # CREATE EXTENSION postgis (needed after first compose up / fresh volume)
pnpm db:push                 # push Drizzle schema to DB
pnpm dev                     # all apps; or dev:native / dev:server
```

- Lint/format fix everything: `pnpm check` (Biome, `--write`). Format only: `pnpm format`.
- Typecheck across all packages: `pnpm check-types` (turbo). Per app: `pnpm -F server check-types`, `pnpm -F native check-types`.
- Tests exist only in the server (Jest): `pnpm -F server test`; single file: `pnpm -F server test -- src/path/file.spec.ts`. E2E config: `pnpm -F server test:e2e`.
- Seed: `pnpm db:seed`.

## Layout

- `apps/server` — NestJS API. Global prefix `/api/v1`. Swagger UI at `/docs` (set up in `main.ts`; controllers carry no Swagger decorators). Feature modules in `src/modules/{auth,file-storage,listing,messaging,user}`, cross-cutting wrappers in `src/common/`, external-system adapters in `src/infrastructures/{database,logger,mail,websocket}`.
- `apps/native` — Expo app. Routes in `app/`, feature code in `features/`, reusable primitives in `components/ui`, API/socket/query clients in `lib/`.
- `packages/db` — Drizzle client + schema split by domain (`schema/{auth,listing,messaging,moderation}.ts`, all relations in `relations.ts`). Exports `@free-on-the-porch/db` and `@free-on-the-porch/db/schema`.
- `packages/env` — zod-validated env (`private.ts` for server vars, `public.ts` for `PUBLIC_*` vars).
- `packages/shared` — Zod schemas, utils, assets shared by server and native. This is the API contract layer.
- `REQUIRED_SCREENS.md` — authoritative screen specs for the mobile app.

## Env gotchas

- Env is loaded via dotenv **inside `packages/env` when imported**, reading root `.env`. Turbo does not load it; scripts like `db:*` rely on this import side effect.
- Public/client vars use the `PUBLIC_` prefix (t3-env), **not** `EXPO_PUBLIC_`. All env vars live in a single `.env` file; public vars are distinguished by their `PUBLIC_` prefix.
- Missing/invalid server env fails fast via zod at import time.

## Auth

- better-auth is configured in `modules/auth/auth.service.ts` (`basePath: "/api/v1/auth"`) and mounted through a catch-all `AuthController` (`@Controller("auth")`) delegating to `toNodeHandler`. Uses `@better-auth/drizzle-adapter` against the shared schema.
- Every route is guarded by default; mark public endpoints with `@Public()` (see `auth.decorator.ts`). Access the session via the custom `@Session()` decorator → `UserSession`; current user id is always `session.user.id`.
- The same guard handles HTTP **and** WebSockets (`context.getType()`); WS clients join room `userId:<id>` on auth.

## Server coding patterns

- **Module layout**: `modules/<domain>/<domain>.module.ts|controller.ts|service.ts` (+ `gateway.ts` for realtime). Controllers are thin: resolve session, validate input, delegate to service, return result. All business logic and DB access lives in services.
- **Validation**: Zod schemas from `@free-on-the-porch/shared/schemas` applied **inline per parameter**, never globally: `@Body(new ZodValidationPipe(CreateListingSchema)) body: CreateListingDto`. For routes where params/query must be split, use `.pick()/.omit()` on the query schema (see `messaging.controller.ts`).
- **DTO naming**: every schema exports a derived type — `export const FooSchema = z.object({...}); export type FooDto = z.infer<typeof FooSchema>`. Never hand-write DTO types. Query schemas with `.default()`/coercion export both `z.input` (`FooQueryDto`) and `z.infer` (`FooQueryOutputDto`) types.
- **Response envelope**: all service returns go through `buildResponse()` (`common/utils/pagination.util.ts`) producing `PaginatedResponse<T>` = `{ data, pagination?: { nextCursor } }`.
- **Pagination is cursor-based keyset**: fetch `limit + 1` rows to detect the next page; cursors are `base64url(JSON)` via `encodeCursor`/`decodeCursor`; each endpoint defines its own cursor shape (with an optional type guard) and passes a `getCursor(lastItem)` extractor.
- **DB access**: inject `DrizzleService` (`this.drizzle.db`), don't call the raw `db` export from feature code. Prefer the relational query API (`drizzle.db.query.<table>.findFirst/findMany` with `with:`/`columns:`). Always restrict user columns with `publicUserSelectFields` from `@free-on-the-porch/db` — never leak full user rows.
- **Multi-step writes** run in `this.drizzle.db.transaction(async (tx) => ...)` (e.g. claim creates thread + members + claim request + first message atomically).
- **Errors**: throw NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`). After destructuring `.returning()`, add `if (!row) throw new Error(...)` purely for TS narrowing.
- **Realtime**: gateways extend nothing but use the composite `@AppWebSocketGateway({ namespace })` decorator (applies `AuthGuard` + CORS). Gateways only broadcast into `userId:<id>` rooms; controllers trigger broadcast after the REST write for dual REST+WS delivery.
- Infra services (mail, logger, DB) are wrapped as Nest modules under `src/infrastructures/` — feature modules depend on those abstractions, never on vendor SDKs directly.

## Shared package patterns (`packages/shared`)

- One file per domain: `schemas/<domain>.schema.ts`, barrel-exported from `schemas/index.ts`. Import as `@free-on-the-porch/shared/schemas` (server and native both).
- **Composition over repetition**: build schemas by spreading `.shape` of base schemas, `.extend()`, `.omit()`, `CreateSchema.partial().shape` for update payloads. Reusable primitives live in `generic.schema.ts` (`TimestampSchema`, `UrlSchema`, `CursorPaginationSchema`, `PaginatedResponse<T>`).
- Enums are `as const` arrays exported alongside their `z.enum` schema (e.g. `LISTING_STATUS` / `ListingStatusSchema`) so clients can iterate options; values are SCREAMING_SNAKE_CASE and mirror pg enums in `packages/db/schema/enums.ts`.
- Utils are small pure functions with named exports (`getErrorMessage`, `getInitials`).

## DB schema patterns (`packages/db/schema`)

- Table names singular snake_case (`listing`, `listing_claim_request`), columns camelCase. PKs are `text().primaryKey().$defaultFn(() => crypto.randomUUID())`.
- Spread `...timestamps` (from `common.ts`: `createdAt` defaultNow, `updatedAt` auto-updates) into every table.
- FKs declare `onDelete: "cascade"` explicitly; indexes/checks go in the table's extras callback array form.
- PostGIS columns use the custom `geographyPoint` type (`listing.ts`) which maps `{ lat, lng }` objects ↔ geography; queries use raw `sql` with ST_* functions (`ST_DWithin`, `<->` ordering).
- The schema derives select shapes from shared Zod schemas (`publicUserSelectFields` is generated from `PublicUserSchema.keyof()`) — keep Zod contracts and DB columns in sync.

## Conventions

- Biome: tabs, double quotes, LF, trailing commas. Tailwind class sorting is enforced on `clsx`/`cva`/`cn` calls.
- Files kebab-case with domain suffixes (`listing.service.ts`, `error.util.ts`, `user.schema.ts`); prefer named exports; types imported with `import type`.
- Native UI: prefer `components/ui` components over raw RN/library components; use prop presets (`Button appearance=...`, `Text type=...`) instead of repeating classNames — details in `.agents/rules/ui-generation.md`.
- Repo-local agent skills live in `.agents/skills/` (better-auth, HeroUI Native, Turborepo, etc.) and rules in `.agents/rules/`.
