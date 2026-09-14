# Server Architecture

This document explains the key architectural patterns in the NestJS server so you can understand how features are built, how the various pieces connect, and how to add new functionality consistently.

## Overview

The server follows NestJS module conventions: feature code lives in `src/modules/<domain>/`, cross-cutting concerns in `src/common/`, and external-system adapters in `src/infrastructures/`. Feature modules depend on infrastructure abstractions (never vendor SDKs directly), use Drizzle via `DrizzleService`, and validate everything through shared Zod schemas.

```
HTTP request / WS connection
        │
        ▼
  AuthGuard (global) ──── @Public() skips auth
        │
        ▼
  Controller (thin) ── ZodValidationPipe per param
        │
        ▼
  Service (business logic + DB via DrizzleService)
        │
        ├─ relational / raw SQL queries (PostGIS for geo)
        └─ optional: gateway.broadcast() for realtime
```

## Module Organization

### Feature modules (`src/modules/`)

Each feature is three-ish files:

| File | Responsibility |
|------|----------------|
| `<domain>.module.ts` | Declares controller + service (+ gateway), imports dependencies, exports the service |
| `<domain>.controller.ts` | **Thin**. Resolves session, validates input inline, delegates to service, returns result |
| `<domain>.service.ts` | All business logic and DB access |
| `<domain>.gateway.ts` | (optional) Socket.IO gateway for realtime |

**Controllers are thin** — they should not contain business logic or direct DB access. Everything goes in the service.

### Infrastructure wrappers (`src/infrastructures/`)

External systems (database, file storage, email, logging, WebSockets) are wrapped as `@Global()` NestJS modules. Feature code depends on these abstractions, not on vendor SDKs. This keeps vendor code isolated and makes swapping implementations (e.g. Mailjet → console mock) trivial.

| Module | What it wraps | How it's used |
|--------|---------------|---------------|
| `database/` | Drizzle client (`@free-on-the-porch/db`) | Inject `DrizzleService`, access via `this.drizzle.db` |
| `logger/` | Custom `AppLogger` + `RequestLoggingInterceptor` | Global logging for every request |
| `mail/` | `MailService` facade → Mailjet or console mock | Send auth/template emails |
| `websocket/` | Composite `@AppWebSocketGateway` decorator | Applies `AuthGuard` + CORS to gateways |

## Authentication

### Overview

The server uses **better-auth** for authentication. It is configured in `modules/auth/auth.service.ts` with `basePath: "/api/v1/auth"` and mounted as a catch-all controller (`AuthController` `@Controller("auth")` delegating to `toNodeHandler`). Better-auth fully handles sign-in, registration, email verification, and password reset.

### The global AuthGuard

`AuthGuard` is registered **globally** via `APP_GUARD` in `AuthModule`, so **every route and socket is protected by default**.

- **HTTP**: The guard calls `getSession({ headers })`; if there's no valid session it throws `UnauthorizedException`. On success it attaches the session to `request.session` (see `auth.type.ts` for the Express `Request` augmentation).
- **WebSocket**: The same guard reads the session from `client.handshake.headers`. On failure it disconnects and throws `WsException`. On success it stores the session in `client.data` and **joins the client to room `userId:<id>`**.

### Public endpoints

Any route can opt out of auth with the `@Public()` decorator (e.g. `GET /listings/feed`, `GET /listings/:id`, and the auth catch-all). The guard checks `Reflector.getAllAndOverride(Public, [...])` and returns `true` early.

### Accessing the current user

In controllers, use the custom `@Session()` parameter decorator to get a `UserSession`. The current user's id is always `session.user.id`.

```ts
@Get("mine")
findMine(@Session() session: UserSession) {
  return this.listingService.findByUser(session.user.id);
}
```

### Adding an endpoint

1. Write a Zod schema in `packages/shared/schemas/<domain>.schema.ts` (if one doesn't exist).
2. Create/update the service method — all DB work goes here.
3. Add a controller route; validate params inline with `ZodValidationPipe`.
4. Mark public routes with `@Public()`. Everything else is protected automatically.

## Validation (Zod, inline)

Validation uses **inline per-parameter pipes**, never a global validation pipe. Each method param that needs validation gets a `new ZodValidationPipe(Schema)`:

```ts
@Body(new ZodValidationPipe(CreateListingSchema)) body: CreateListingDto
```

`ZodValidationPipe` (`common/pipes/zod.pipe.ts`) runs `safeParse`, and on failure throws `BadRequestException` with `fromZodError`-formatted details.

For routes where the query schema must be split between path params and query string, use `.pick()` / `.omit()` on the schema (see `messaging.controller.ts` `GET /conversations/:type/:id`).

## Database Access

**All DB access goes through `DrizzleService`**, never the raw `db` export:

```ts
constructor(private readonly drizzle: DrizzleService) {}
// use: this.drizzle.db.query.<table>.findFirst({ ... })
//      this.drizzle.db.insert(...).values(...).returning()
```

**Prefer the relational query API** (`this.drizzle.db.query.<table>.findFirst/findMany` with `with:` / `columns:`) over hand-written joins. It's type-safe and reads clearly.

**Always restrict user columns** using `publicUserSelectFields` from `@free-on-the-porch/db` when you embed a user in a response — never leak full user rows:

```ts
with: {
  user: { columns: publicUserSelectFields },
}
```

**Multi-step writes** run in a transaction:

```ts
await this.drizzle.db.transaction(async (tx) => { ... });
```

### PostGIS geospatial queries

Because listings have a `location` geography column, geo queries use **raw SQL** with PostGIS functions. The `geographyPoint` Drizzle type maps `{ lat, lng }` ↔ `geography(Point, 4326)` automatically.

- **Distance calc**: `sql`ST_Distance(${t.location}, ${pointSql})```
- **Radius filter**: `sql`ST_DWithin(${t.location}, ${pointSql}, ${radiusMeters})```
- **Distance ordering**: the `<->` operator
- **Build search point**: `sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography```

## Pagination (Cursor-based keyset)

**Every list endpoint uses cursor-based keyset pagination** via `common/utils/pagination.util.ts`.

The pattern:
1. Fetch `limit + 1` rows.
2. If you got more than `limit`, a next page exists — trim the extra row and encode a cursor from the last item.
3. Return `{ data, pagination: { nextCursor } }` (`buildResponse`).

Cursors are `base64url(JSON(payload))`, and each endpoint defines its **own cursor shape**:

- `listing.service.ts` geo: `{ d: distanceMeters, id }` with an `isGeoCursor` type guard.
- `messaging.service.ts` messages: `{ createdAt, id }`.

Decode with `decodeCursor(raw, typeGuard?)` (pass a type guard for full type safety), and wrap results with `buildResponse(data, { type: "cursor", limit, getCursor })`.

```ts
const decodedCursor = query.cursor ? decodeCursor(query.cursor, isGeoCursor) : null;
// ... where: cursor condition filters items after the decoded cursor ...
const rows = await this.drizzle.db.query.listing.findMany({ ..., limit: query.limit + 1 });
return buildResponse(rows, { type: "cursor", limit: query.limit, getCursor: (l) => ({ d: l.distanceMeters, id: l.id }) });
```

## Realtime Messaging

Messaging has **dual REST + WebSocket delivery**:

1. The client POSTs to `POST /api/v1/messaging` (REST).
2. `MessagingService.sendMessage` does the DB write and returns the new message + `memberIds`.
3. The controller then calls `MessagingGateway.broadcastMessage(memberIds, message)`, which emits `new_message` to every member's `userId:<id>` room — **skipping the sender** (they already see it via the REST response).

```ts
// messaging.controller.ts
const { message, memberIds } = await this.messagingService.sendMessage(session.user.id, body);
this.messagingGateway.broadcastMessage(memberIds, message);
return message;
```

Gateways are defined with the composite `@AppWebSocketGateway({ namespace })` decorator (from `infrastructures/websocket/ws.decorator.ts`), which bundles `WebSocketGateway({ cors, namespace })` + `UseGuards(AuthGuard)`. The `AuthGuard` authenticates the socket on connect and drops it into `userId:<id>`. Gateways only ever broadcast into those rooms.

## Response Envelope

All service returns go through `buildResponse()` producing:

```ts
{ data: T, pagination?: { nextCursor: string | null } }
```

Single items are wrapped too (`{ data }`) for consistency.

## Error Handling

Services throw NestJS HTTP exceptions:

| Exception | When |
|-----------|------|
| `NotFoundException` | Resource doesn't exist |
| `BadRequestException` | Invalid request / bad validation |
| `ConflictException` | Duplicate (e.g. claim already requested) |
| `ForbiddenException` | User not the owner |

After `.returning()` destructuring, add `if (!row) throw new Error(...)` purely to satisfy TypeScript narrowing (the DB would have thrown a real error anyway).

## New Feature Checklist

To add a new feature (e.g. "reports"):

1. **`packages/shared/schemas/<feature>.schema.ts`** — Zod schemas + derived DTO types (the API contract).
2. **`packages/db/schema/<feature>.ts`** — Drizzle tables + enums + relations.
3. **`apps/server/src/modules/<feature>/`** — `module.ts`, `controller.ts`, `service.ts` (+ `gateway.ts` if realtime).
4. Add to the DOMAIN in the db `enums.ts` if needed, and `db:generate`/`db:push` the schema.
5. Wire the module into `app.module.ts`.
