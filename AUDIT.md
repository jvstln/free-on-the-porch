# Codebase Audit

> Generated from a full review of server, DB, shared, native, and config.
> Checkboxes track completion status.

---

## P0 — Immediate (security + broken)

- [x] **#1** `console.log(env)` leaks all secrets to stdout on every import of `@free-on-the-porch/db`
  - File: `packages/db/index.ts:10`
  - **Status:** Already removed — file is clean.
- [x] **#2** `getConversation` DM query uses `OR` — allows reading any DM thread the caller is not a member of
  - File: `apps/server/src/modules/messaging/messaging.service.ts:243-258`
  - **Fix:** Changed to require current user as member via `exists` subquery + post-query check that target user is also a member for DM type.
- [x] **#3** `markRead` doesn't verify thread membership; `receiverId` column doesn't exist on `message` table
  - File: `apps/server/src/modules/messaging/messaging.service.ts:407-424`
  - **Fix:** Added thread membership check, removed dead `receiverId` logic, made `threadId` required.
- [x] **#4** `db:init` uses wrong postgres user (`postgres`) and DB name (`free-on-the-porch`) instead of `porch`/`porch`
  - File: `package.json:20`
  - **Fix:** Changed to `-U porch -d porch` to match compose.yaml.
- [x] **#5** Auth cookies set `secure: true` + `sameSite: "none"` unconditionally — breaks dev on localhost
  - File: `apps/server/src/modules/auth/auth.service.ts:66-71`
  - **Fix:** Made `sameSite` and `secure` conditional on `NODE_ENV` — `lax`/`false` in dev, `none`/`true` in production.

---

## P1 — Security + Auth

- [x] **#6** `UserService.getUser` is a debug stub returning `to_tsvector('testing')` cast as `any`
  - File: `apps/server/src/modules/user/user.service.ts:15-32`
  - **Status:** Reimplemented — relational query with `publicUserSelectFields`, throws `NotFoundException`, wraps in `buildResponse`.
- [x] **#7** `PATCH /users/me` returns hardcoded "under maintainance" message; `updateProfile` not implemented
  - File: `apps/server/src/modules/user/user.controller.ts:23-30`
  - **Status:** Implemented `UserService.updateProfile` (partial update of `name`/`image`/`bio`) and wired the controller to it.
- [x] **#8** `getConversation` type `"listings"` leaks full thread to non-members
  - File: `apps/server/src/modules/messaging/messaging.service.ts:251-257`
  - **Status:** Resolved by the P0 #2 membership fix — the `exists`/nested `threadMembers: { userId }` filter applies to all types including `"listings"`, so non-members get `null` → `NotFoundException`.

---

## P2 — Unimplemented Features (scaffolded but no backend)

- [ ] **#9** Create Listing route — Post tab navigates to 404
  - Missing: `apps/native/app/dashboard/listings/new/`
- [ ] **#10** Moderation (Report/Block) — DB schema + seed exist, zero server endpoints
  - Missing: `apps/server/src/modules/moderation/`
- [ ] **#11** Comments — DB table + shared schema exist, no create/list endpoints
  - File: `packages/db/schema/listing.ts:152-164`
- [ ] **#12** Notifications — DB table + seed exist, no server module
  - File: `packages/db/schema/messaging.ts:78-97`
- [ ] **#13** File Uploads — `FileStorageService` exists but never injected; Cloudinary config commented out
  - Files: `file-storage.service.ts`, `cloudinary.provider.ts:7-12`
- [ ] **#14** Mailjet — provider hardcoded to `"console"`, production path dead
  - File: `apps/server/src/infrastructures/mail/mail.service.ts:126-127`
- [ ] **#15** Swagger docs — `/docs` served but zero `@Api*` decorators on any controller
  - File: `apps/server/src/main.ts:14-22`

---

## P3 — Data Integrity / Race Conditions

- [ ] **#16** `claim` uses `this.drizzle.db` for reads inside `drizzle.db.transaction()` — race condition allowing duplicate claims
  - File: `apps/server/src/modules/listing/listing.service.ts:237-254`
- [ ] **#17** `claim` never updates `listing.status` or `claimedByUserId` — half-wired
  - File: `apps/server/src/modules/listing/listing.service.ts:201-291`
- [ ] **#18** `listing.update` allows arbitrary status changes without enforcing `claimedByUserId` check constraint
  - File: `apps/server/src/modules/listing/listing.service.ts:293-328`

---

## P4 — Missing DB Indexes

- [x] **#19** `listing.location` — missing GiST spatial index (full table scan on every nearby query)
  - File: `packages/db/schema/listing.ts`
  - **Status:** Added `listing_location_gist_idx` via `index().using("gist", table.location)` — verified `CREATE INDEX ... USING gist (location)` in Postgres.
- [x] **#20** `listing_claim_request` — missing unique `(listingId, userId)` constraint
  - File: `packages/db/schema/listing.ts`
  - **Status:** Added `uniqueIndex("listing_claim_request_listing_user_key")` — one claim request per (listing, user).
- [x] **#21** `thread_member` — missing unique `(threadId, userId)` + index on `userId`
  - File: `packages/db/schema/messaging.ts`
  - **Status:** Added unique `(threadId, userId)` constraint + `thread_member_userId_idx`.
- [x] **#22** `comment` — missing index on `listingId`
  - File: `packages/db/schema/listing.ts`
  - **Status:** Added `comment_listingId_idx`.
- [x] **#23** `report` / `block` — missing lookup indexes
  - File: `packages/db/schema/moderation.ts`
  - **Status:** Added `report_reportedById_idx`, `report_reportedUserId_idx`, `report_listingId_idx`, and `block_blockedId_idx`.

---

## P5 — Schema Inconsistencies

- [x] **#24** `MessageSchema.threadId` is `.nullable()` but DB column is `NOT NULL`
  - Files: `packages/shared/schemas/message.schema.ts`
  - **Status:** Made `threadId` `z.string()` (non-nullable) to match the DB.
- [x] **#25** `SendMessageSchema` has no mutual-exclusivity refinement for `threadId`/`listingId`/`receiverId`
  - File: `packages/shared/schemas/message.schema.ts`
  - **Status:** Added `.superRefine` — exactly one of `threadId`/`listingId`/`receiverId` required. Native `useSendMessage` updated to send only one target (previously sent both `receiverId` + `threadId` together).
- [x] **#26** `MessageMinimalSchema` is `.omit({})` — identical to `MessageSchema` (no-op)
  - File: `packages/shared/schemas/message.schema.ts`
  - **Status:** Removed `MessageMinimalSchema`/`MessageMinimalDto`; `MessageSchema` used directly.
- [x] **#27** `listing.thread` relation is `r.one` but DB allows many threads per listing
  - File: `packages/db/schema/relations.ts`
  - **Status:** Changed to `r.many.thread()` (each claimant gets their own LISTING thread).
- [x] **#28** `notification`, `report`, `block`, `verification` tables have zero relations defined
  - File: `packages/db/schema/relations.ts`
  - **Status:** Added relations for `notification`, `report`, `block` (+ inverse relations on `user`/`listing`). `verification` has no FK to `user` (identifier-keyed better-auth table), so no relational edge is possible — noted in a comment.
- [x] **#29** `CreateReportSchema` doesn't prevent self-reports
  - File: `packages/shared/schemas/report.schema.ts`
  - **Status:** Added `createReportSchema(reporterId)` factory — passes `session.user.id` server-side to reject `reportedUserId === reporterId`. Plus a DB CHECK constraint (`report_reportedById_ne_reportedUserId`) as defense-in-depth, verified against Postgres (self-report insert rejected, legit insert passes).

---

## P6 — Native App Gaps

- [ ] **#30** Map not a separate tab — deviates from REQUIRED_SCREENS (should be Feed/Map/Inbox/Profile)
  - File: `apps/native/app/dashboard/_layout.tsx`
- [ ] **#31** Modal screen is a static example — Report Sheet, Image Viewer, Confirm Delete not implemented
  - File: `apps/native/app/modal.tsx`
- [ ] **#32** Profile/report actions are `Alert.alert` only — no API calls
  - File: `apps/native/features/user/public-profile-page.tsx:199-212`
- [ ] **#33** Settings notification toggles are dummy `useState(true)` with no backend
  - File: `apps/native/features/user/settings-page.tsx:36-37`
- [ ] **#34** Mock data fallbacks (`MOCK_USER`, `MAP_MOCK`) used in multiple files
- [ ] **#35** Cache key mismatch: `["myListings"]` vs `["listings","mine"]`
  - File: `apps/native/features/user/use-user.ts:12`
- [ ] **#36** `router.push(... as any)` defeats typed routes
  - File: `apps/native/features/user/public-profile-page.tsx:89,102,156`
- [ ] **#37** Hardcoded hex colors instead of `global.css` tokens
  - Files: form, my-listings, maps, profile screens

---

## P7 — Dead Code / Unused Imports

- [ ] **#38** `messaging.service.ts` — `db`, `ne` imports unused; `as any` casts and `(t: any)` type params
- [ ] **#39** `user.service.ts` — `db`, `eq`, `publicUserSelectFields`, `buildResponse`, `NotFoundException` all unused
- [ ] **#40** `messaging.gateway.ts` — `SendMessageDto`, `MessageBody`, `SubscribeMessage` imported but never used
- [ ] **#41** `http-exception.filter.ts` — entire file commented out
- [ ] **#42** `auth.type.ts` — socket.io module augmentation commented out
- [ ] **#43** `ws.decorator.ts` / `ws.type.ts` — `WsSession`, `AuthenticatedSocket` defined but never used
- [ ] **#44** `generic.schema.ts` — `Satisfies<T,K>` unused; `PaginationQuerySchema` unused
- [ ] **#45** `db/schema/auth.ts` — `publicUserColumns` unused
- [ ] **#46** `db/schema/common.ts` — `toJsonbObject` unused
- [ ] **#47** `shared/types/index.ts` — `ZodMeta` unreachable (not in package exports)
- [ ] **#48** Native: `@react-navigation/drawer`, `@react-navigation/elements`, `drizzle-orm` in `package.json` but unused

---

## P8 — Config / Tooling

- [ ] **#49** `packages/db` has no `check-types` script — not covered by `pnpm check-types`
- [ ] **#50** `@free-on-the-porch/config` is in server `dependencies` but should be `devDependencies`
- [ ] **#51** `tsx` used by seed script but not declared as a dependency in `packages/db`
- [ ] **#52** `@nestjs/mapped-types: "*"` — wildcard, should be pinned to `^11`
- [ ] **#53** Duplicate `eas.json` at root and `apps/native/` with conflicting CLI versions
- [ ] **#54** No `.github/workflows/` — zero CI/CD
- [ ] **#55** `ConfigModule.forRoot()` redundant — env already loaded by `@free-on-the-porch/env/private`
- [ ] **#56** `auth.controller.ts` uses `@All("*any")` — non-standard NestJS wildcard
- [ ] **#57** 79 Biome warnings: 43x `noExplicitAny`, 13x `noUnusedImports`, 9x unused params, 6x unused vars
- [ ] **#58** `app.controller.spec.ts` test asserts wrong return value — will fail
- [ ] **#59** `app.controller.ts` says "free on the pouch" (repo name, not app name)
- [ ] **#60** Inconsistent response envelopes — many endpoints don't use `buildResponse()`
