# Free on the Porch — Server

NestJS 11 backend API for the Free on the Porch mobile app. Users post unwanted household items for free and nearby users browse and claim them.

## Stack

- **NestJS 11** with Express adapter, Socket.IO for WebSockets
- **better-auth** for authentication (email + password, Expo plugin), backed by the shared Drizzle schema
- **Drizzle ORM** (PostgreSQL) via `@free-on-the-porch/db`, with **PostGIS** for geospatial queries
- Shared API contracts (Zod schemas) from `@free-on-the-porch/shared/schemas`

## Getting Started

```bash
pnpm install
docker compose up -d db      # Postgres + PostGIS
pnpm db:init                 # CREATE EXTENSION postgis (once)
pnpm db:push                 # push schema
pnpm dev:server              # or `pnpm -F server start:dev`
```

The API runs at `http://localhost:<PORT>` (default 3000) with a global prefix of `/api/v1`. Swagger UI is at `/docs`.

## Commands

```bash
pnpm -F server start:dev     # watch mode
pnpm -F server build         # compile (nest build, SWC)
pnpm -F server check-types   # TypeScript check
pnpm -F server lint          # Biome check --write
pnpm -F server test          # Jest unit tests
pnpm -F server test:e2e      # Jest E2E tests
```

## Project Layout

```
src/
├── main.ts                    # Bootstrap: prefix, CORS, Swagger
├── app.module.ts              # Root module (imports all feature + infra modules)
├── common/                    # Cross-cutting: zodiac pipe, pagination util, constants
├── infrastructures/           # Wrappers over external systems
│   ├── database/              #   DrizzleService (the sanctioned Drizzle access)
│   ├── file-storage/          #   Cloudinary adapter
│   ├── logger/                #   AppLogger + request logging interceptor
│   ├── mail/                  #   Email (Mailjet or console mock) + templates
│   └── websocket/             #   Composite @AppWebSocketGateway decorator
└── modules/                   # Feature modules
    ├── auth/                  #   better-auth, AuthGuard, @Public/@Session decorators
    ├── listing/               #   listing CRUD, nearby (PostGIS), claim
    ├── messaging/             #   threads/messages, Socket.IO gateway
    └── user/                  #   profile endpoints (WIP)
```

## API Endpoints

All routes are behind the global prefix `/api/v1`. Everything is **auth-protected by default**; public endpoints are marked `@Public()`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| All | `/auth/*` | Public | better-auth endpoints (sign in, register, verify, reset) |
| GET | `/users/me` | ✅ | Current user from session |
| GET | `/users/:id` | ✅ | Public user profile (WIP) |
| PATCH | `/users/me` | ✅ | Update profile (under maintenance) |
| POST | `/listings` | ✅ | Create a listing |
| GET | `/listings/nearby` | Public | Near-map, PostGIS cursor pagination |
| GET | `/listings/mine` | ✅ | Current user's listings |
| GET | `/listings/:id` | Public | Single listing detail |
| POST | `/listings/:id/claim` | ✅ | Claim a listing (creates thread + auto-message) |
| PATCH | `/listings/:id` | ✅ | Update listing (owner only) |
| DELETE | `/listings/:id` | ✅ | Remove listing (owner only) |
| POST | `/messaging` | ✅ | Send a message (REST + WS broadcast) |
| GET | `/messaging/threads` | ✅ | List conversations |
| GET | `/messaging/conversations/:type/:id` | ✅ | Fetch a conversation |
| POST | `/messaging/:userId/read` | ✅ | Mark messages read |

## Testing

Unit tests live next to code as `*.spec.ts` files (Jest + ts-jest). E2E tests are under `test/`.

```bash
pnpm -F server test          # all unit tests
pnpm -F server test -- src/path/file.spec.ts   # single file
pnpm -F server test:e2e      # e2e suite
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deep dive into the auth flow, pagination pattern, PostGIS queries, and realtime messaging.
