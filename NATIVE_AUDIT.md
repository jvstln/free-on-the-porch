# Native App Audit

Comprehensive analysis of `apps/native` — Expo SDK 55, Expo Router, React 19, HeroUI Native + Uniwind, TanStack Query + Zustand.

---

## P0 — Critical Bugs

- [x] **#N1** `forgot-password-page.tsx:23` — Initial step is `"SUCCESS"` instead of `"EMAIL"`. Users see "Reset Link Sent" immediately without entering their email.
  - **Fix:** Changed initial state from `"SUCCESS"` to `"EMAIL"`.
- [x] **#N2** `listing-form.tsx:29-30` — Hardcoded Windows filesystem path `file:///C:/Users/Jvstln/...` as `MAP_MOCK`. Crashes on any other machine.
  - **Fix:** Removed `MAP_MOCK` constant and replaced the pickup location card with a "coming soon" placeholder.
- [x] **#N3** `public-profile-page.tsx:22-25, 103-173` — "Message" button imports from `features/mock/mock-data.ts`, mutates in-memory arrays, navigates to fake thread IDs. Prototype code in production.
  - **Fix:** Replaced mock messaging with `useSendMessage` hook. Sends initial DM via real API, navigates to created thread.
- [x] **#N4** `create-listing-page.tsx:35` — Location hardcoded to `{ lat: 40.7312, lng: -74.2644 }`. Never uses actual user location.
  - **Fix:** Made `location` optional in `CreateListingSchema`. Server defaults to Maplewood coordinates when omitted.
- [x] **#N5** `colors.util.ts:11-15` — References undefined CSS variables (`--color-success`, `--color-warning`). Components using these colors render with no styling.
  - **Fix:** Added `--success`, `--warning`, `--neutral-800` CSS variables and their `@theme` mappings in `global.css`.
- [x] **#N6** `_layout.tsx:6` — `initialRouteName: "(drawer)"` references non-existent route group.
  - **Fix:** Changed to `"(auth)"`.

---

## P1 — Security / Data Integrity

- [x] **#N7** `settings-page.tsx:69-78` — "Delete Account" just calls `authClient.signOut()`. No actual server-side deletion.
  - **Fix:** Added `DELETE /users/me` endpoint. Settings page now calls server API before signing out.
- [x] **#N8** `settings-page.tsx:44-47` — Blocked users list is hardcoded mock data. Unblock only updates local state, not server.
  - **Fix:** Added `GET /moderation/blocks` endpoint. Settings page uses `useBlocks` hook, unblock calls `removeBlock` mutation.
- [x] **#N9** `lib/socket-client.ts:5-6` — Socket singleton connects eagerly on module import, even for unauthenticated users. Never disconnected on sign-out.
  - **Fix:** Refactored to lazy-init with `getMessagingSocket()` + `connectMessagingSocket()`. Socket only connects when messaging hooks mount.
- [x] **#N10** Sign-out does not clear react-query cache (`profile-page.tsx:37`, `settings-page.tsx:51`, `user-menu.tsx:56`). Stale data from previous user persists.
  - **Fix:** Added `queryClient.clear()` before `authClient.signOut()` in all three sign-out handlers.
- [x] **#N11** `auth-guard.tsx:87-90` — First-launch redirect goes to `/dashboard/listings` instead of welcome page. Logic contradicts comments.
  - **Fix:** First-launch users now redirect to `/` (welcome page). Returning users go to `/dashboard/listings`.
- [x] **#N12** `lib/api.ts:47` — Regex `/\s+/` missing global flag. Only first whitespace sequence is collapsed.
  - **Fix:** Changed to `/\s+/g`.
- [x] **#N13** `lib/api.ts:43-52` — 401 interceptor checks for `"user not logged in"` string. Brittle coupling with server error messages.
  - **Fix:** Removed string check. All 401 responses now open the auth sheet.

---

## P2 — Missing Features / Incomplete Wiring

- [ ] **#N14** `(modal)/confirm.tsx:19-21` — Confirm modal's action just calls `router.back()`. No callback mechanism to execute real confirmations.
- [ ] **#N15** `settings-page.tsx:291-309` — Terms of Service and Privacy Policy links are `Pressable` with no `onPress` handler.
- [ ] **#N16** `login-form.tsx:115-122` — Google and Apple social login buttons have no `onPress` handler.
- [ ] **#N17** `edit-profile-page.tsx:41-46` — Image upload toggles between two hardcoded URLs. Does not use `expo-image-picker`.
- [ ] **#N18** `listing-form.tsx:424-449` — "Set Pickup Location" section uses static mock image and hardcoded address `"124 Maple Terrace, Maplewood"`. "Change" button does nothing.
- [ ] **#N19** `message-thread-page.tsx:154` — "Online now" text is hardcoded. No actual presence tracking via socket.
- [ ] **#N20** `app/dashboard/listings/me.tsx` — MyListingsPage route exists but is unreachable from navigation.
- [ ] **#N21** `listings-map.tsx:297-329` — Map markers are mathematically positioned around center, not at actual listing coordinates from API.
- [ ] **#N22** No location permission handling anywhere in the app. Map always centers on hardcoded `DEFAULT_COORDS`.
- [ ] **#N23** `global.css:87-90` — Dark mode variant commented out with placeholder values. `ThemeToggle` exists but does nothing.

---

## P3 — Data Fetching / Cache Invalidation

- [x] **#N24** `use-listings.ts:62-64` — `useCreateListing` does not invalidate `["listings", "nearby"]` feed cache.
  - **Fix:** Added `queryClient.invalidateQueries({ queryKey: ["listings", "nearby"] })` to `onSuccess`.
- [x] **#N25** `use-listings.ts:73-75` — `useUpdateListing` does not invalidate `["listings", id]` detail cache.
  - **Fix:** Added `queryClient.invalidateQueries({ queryKey: ["listings", id] })` and nearby feed invalidation.
- [x] **#N26** `use-listings.ts:84-86` — `useDeleteListing` does not invalidate `["listings", id]` detail cache.
  - **Fix:** Added `queryClient.invalidateQueries` for detail and nearby feed. Used `onSuccess: (_data, id)` to capture the deleted id.
- [x] **#N27** `use-listings.ts:96-98` — `useClaimListing` does not invalidate `["messaging", "inbox"]` (claim creates a thread server-side).
  - **Fix:** Added `queryClient.invalidateQueries({ queryKey: ["messaging", "inbox"] })`.
- [x] **#N28** `use-user.ts:13-16` — `useUpdateProfile` does not invalidate `["users"]` profile queries.
  - **Fix:** Added `queryClient.invalidateQueries({ queryKey: ["users"] })`.
- [x] **#N29** `message-thread-page.tsx:74-83` — `useEffect` for `markRead` is missing `markReadMutation` in dependency array (stale closure).
  - **Fix:** Added `markReadMutation` to the dependency array.
- [x] **#N30** `use-comments.ts` — Comment create/delete does not invalidate listing detail `["listings", id]` (stale comment count).
  - **Fix:** Added `queryClient.invalidateQueries({ queryKey: ["listings", listingId] })` to both mutations.
- [x] **#N31** `use-moderation.ts:20` — `useCreateBlock` invalidates `["listings"]` prefix (refetches ALL listing queries). Should be targeted.
  - **Fix:** Changed to invalidate `["listings", "nearby"]` only, plus `["moderation", "blocks"]`.

---

## P4 — Type Safety / Code Quality

- [x] **#N32** `comments.api.ts:4-16` — Comment type defined locally instead of using shared schema. Can drift out of sync.
  - **Fix:** Replaced local `Comment` interface with `ListingCommentDto` from `@free-on-the-porch/shared/schemas`.
- [x] **#N33** `moderation.api.ts:9,17,25` — All moderation endpoints return `{ data: unknown }`. No type safety.
  - **Fix:** Added `BlockRecord` and `ReportRecord` interfaces. Updated endpoint return types.
- [x] **#N34** `profile-page.tsx:25`, `edit-profile-page.tsx:37` — `session?.user as unknown as CurrentUserDto` double cast through `unknown`.
  - **Fix:** Changed to single `as CurrentUserDto` cast (structurally compatible).
- [x] **#N35** `listings.api.ts:14` — `getNearby` return type annotation doesn't match actual response structure.
  - **Fix:** Added explicit `Promise<PaginatedResponse<ListingDto[]>>` return type.
- [x] **#N36** `listings.api.ts:80` — `claim` return typed as `ThreadDto` but server returns listing detail.
  - **Fix:** Changed to `ThreadMinimalDto` (matching server's `PaginatedResponse<ThreadMinimalDto>`).
- [x] **#N37** `query-state.tsx:83` — `console.log("refetching", query)` left in production code.
  - **Fix:** Removed console.log.
- [x] **#N38** `register-form.tsx:46,51` — `console.log` left in registration error/success handlers.
  - **Fix:** Removed both console.log statements.
- [x] **#N39** `use-messaging.ts:106,133` — `console.log` left in socket event handlers.
  - **Fix:** Removed console.log statements. (Also removed catch-block console.logs in listing-location-map.tsx and listings-map.tsx.)

---

## P5 — Hardcoded Colors / Design System Violations

- [x] **#N40** `my-listings-page.tsx:37,58,65,70` — `text-[#7A6A5A]`, `text-[#A89880]` instead of `text-muted-foreground`.
  - **Fix:** Replaced with `text-muted-foreground`. Also switched to project `RefreshControl` wrapper.
- [x] **#N41** `comment-section.tsx:102`, `message-thread-page.tsx:274`, `report.tsx:122` — `placeholderTextColor="#A89880"` hardcoded.
  - **Fix:** Used `useResolveClassNames("text-muted-foreground")` for dynamic color resolution.
- [x] **#N42** `form.tsx:184-185` — `SwitchField` uses raw `Switch` with hardcoded colors instead of project's `Switch` component.
  - **Fix:** Replaced raw RN `Switch` import with project's `@/components/ui/switch`. Removed hardcoded trackColor/thumbColor.
- [x] **#N43** `switch.tsx:8-10` — Default `trackColor`/`thumbColor` hardcoded as hex instead of CSS variables.
  - **Fix:** Rewritten to use `useResolveClassNames` for dynamic trackColor/thumbColor from theme.
- [x] **#N44** `profile-page.tsx:66,273` — `tintColor="#316342"` in RefreshControl. Should use theme token.
  - **Fix:** Switched to project `RefreshControl` wrapper with `className="text-primary"`.
- [x] **#N45** `report.tsx:116` — Uses raw `TextInput` instead of project's `Input` or `Textarea` UI component.
  - **Fix:** Replaced raw `TextInput` with project's `Textarea` component.

---

## P6 — Performance

- [x] **#N46** `listings-page.tsx:211-213` — Array slicing for bento grid recomputed every render. Needs `useMemo`.
  - **Skip:** React Compiler is enabled (`experiments.reactCompiler: true`). Compiler auto-memoizes.
- [x] **#N47** `public-profile-page.tsx:44-54` — Fetches ALL nearby listings (limit 100) and filters client-side to find one user's listings.
  - **Fix:** Added `GET /listings/user/:userId` public endpoint + `useUserListings` hook. Replaced wasteful fetch-and-filter.
- [x] **#N48** `listing-detail-page.tsx` — Multiple handlers (`handleClaim`, `navigateToDmThread`, `handleMarkPickedUp`, `handleDelete`) recreated every render without `useCallback`.
  - **Skip:** React Compiler is enabled. Compiler auto-memoizes.
- [x] **#N49** `message-thread-page.tsx:85-92` — `scrollToEnd` uses `setTimeout(100ms)` which is fragile on slow devices.
  - **Fix:** Replaced `setTimeout` with `onContentSizeChange` on FlatList.
- [x] **#N50** `listing-form.tsx:44-68` — Duplicate `CATEGORY_MAP` objects. Same map exists in `listings.constants.ts`.
  - **Fix:** Imports from shared constants, derives `FORM_CATEGORIES` and `CATEGORY_MAP` from `CATEGORY_LABEL`.
- [x] **#N51** `settings-page.tsx:39-41` — `useState` initializer for `radiusKm` runs once. Stale when `settings` loads async.
  - **Fix:** Removed local `useState`, derive `radiusKm` directly from async `settings` data.

---

## P7 — Dead Code / Unused

- [x] **#N52** `components/theme-toggle.tsx` — Not imported anywhere.
  - **Fix:** Deleted file.
- [x] **#N53** `features/auth/components/otp-verification.tsx` — Not imported anywhere.
  - **Fix:** Deleted file.
- [x] **#N54** `components/ui/text.tsx:5-90` — Large block of commented-out code (old textVariants).
  - **Fix:** Removed 85 lines of commented-out code.
- [x] **#N55** `components/ui/button.tsx:150` — Commented-out `{/* {resolvedChildren} */}`.
  - **Fix:** Removed commented-out line.
- [x] **#N56** `features/listings/components/listing-form.tsx:30` — `MAP_MOCK` constant is a dead Windows path.
  - **Fix:** Already removed in P0 fix for #N2.
- [x] **#N57** `features/mock/mock-data.ts` — 511-line mock data file imported by production code.
  - **Fix:** Deleted entire `features/mock/` directory.
- [x] **#N58** `components/ui/input/search-input.tsx:26` — Commented-out `SearchField.ClearButton`.
  - **Fix:** Removed commented-out line.
- [x] **#N59** `lib/colors.util.ts:26` — Empty string `""` in `colorAliases.primary` array.
  - **Fix:** Replaced with uppercase condition values (`"GOOD"`, `"LIKE_NEW"`, `"NEW"`).
