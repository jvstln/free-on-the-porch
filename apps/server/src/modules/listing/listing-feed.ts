/**
 * Feed ordering domain for listings.
 *
 * The feed can be ordered in three ways:
 *  - "blend" (default): mixes proximity with freshness so recent posts bubble
 *    up like a social feed instead of pure distance ordering;
 *  - "newest": pure chronological recency;
 *  - "search": ts_rank_cd relevance, active whenever a search term is present.
 *
 * Because the blend score and ts_rank are computed at query time (not stored),
 * cursor-based keyset pagination carries the last item's ordering value plus
 * its id as a tie-break. That logic lives here so the service only orchestrates
 * the query; the SQL snippets are shared between the SELECT extras, the ORDER BY
 * and the keyset continuation clause (defined once, not tripled).
 */

import type { listing as listingTable } from "@free-on-the-porch/db";
import type { FeedListingsQueryOutputDto } from "@free-on-the-porch/shared/schemas";
import { and, eq, lt, or, type SQL, sql } from "drizzle-orm";

// How many "distance meters" one hour of age adds to an item's effective
// distance in the default blend ordering. Higher pushes fresh items up harder.
export const FRESHNESS_METERS_PER_HOUR = 250;

/** The listing table's columns — usable for the table itself or the extras `t`. */
export type ListingFeedColumns = typeof listingTable;

// ─── Cursors ───────────────────────────────────────────────────────────────────

type BlendCursor = {
	/** feedScore of the last item (distance + freshness blend) */
	s: number;
	/** id of the last item (tie-break for stable keyset pagination) */
	id: string;
};

type RankCursor = {
	/** ts_rank_cd of the last item */
	r: number;
	/** id of the last item (tie-break) */
	id: string;
};

type NewestCursor = {
	/** ISO createdAt of the last item */
	ts: string;
	/** id of the last item (tie-break) */
	id: string;
};

export type FeedCursor = BlendCursor | RankCursor | NewestCursor;

// Runtime guards used by decodeCursor to validate that decoded cursor JSON
// actually matches the expected ordering's shape before it is trusted.
export function isBlendCursor(val: unknown): val is BlendCursor {
	return (
		typeof val === "object" &&
		val !== null &&
		typeof (val as BlendCursor).s === "number" &&
		typeof (val as BlendCursor).id === "string"
	);
}

export function isRankCursor(val: unknown): val is RankCursor {
	return (
		typeof val === "object" &&
		val !== null &&
		typeof (val as RankCursor).r === "number" &&
		typeof (val as RankCursor).id === "string"
	);
}

export function isNewestCursor(val: unknown): val is NewestCursor {
	return (
		typeof val === "object" &&
		val !== null &&
		typeof (val as NewestCursor).ts === "string" &&
		typeof (val as NewestCursor).id === "string"
	);
}

// ─── Ordering ─────────────────────────────────────────────────────────────────

/** The shape of a hydrated feed row that carrries ordering values. */
export type FeedRow = {
	id: string;
	feedScore: number;
	matchRank: number;
	createdAt: Date;
};

/** A fully-resolved ordering descriptor for the current request. */
export interface FeedOrder {
	mode: "blend" | "newest" | "search";
	cursorGuard: (val: unknown) => val is FeedCursor;
	orderBy: (t: ListingFeedColumns) => SQL;
	getCursor: (row: FeedRow) => FeedCursor;
}

/**
 * Distance + freshness penalty: an item one hour old counts FRESHNESS_* meters
 * farther away. Shared by the blend score (SELECT extra), its ORDER BY and its
 * keyset continuation clause so the formula is defined in exactly one place.
 */
export function buildFeedBlendScore(t: ListingFeedColumns, pointSql: SQL): SQL {
	return sql`ST_Distance(${t.location}, ${pointSql}) + (EXTRACT(EPOCH FROM (NOW() - ${t.createdAt})) / 3600 * ${FRESHNESS_METERS_PER_HOUR})`;
}

/** Resolve the ordering mode + fragments described by the query DTO. */
export function resolveFeedOrder(
	query: Pick<FeedListingsQueryOutputDto, "query" | "sort">,
	tsquery: SQL | null,
	pointSql: SQL,
): FeedOrder {
	const mode: FeedOrder["mode"] = query.query
		? "search"
		: query.sort === "newest"
			? "newest"
			: "blend";

	switch (mode) {
		case "search":
			return {
				mode,
				cursorGuard: isRankCursor,
				orderBy: (t) =>
					sql`ts_rank_cd(${t.searchVector}, ${tsquery}) DESC, ${t.id}`,
				getCursor: (row) => ({ r: row.matchRank, id: row.id }),
			};
		case "newest":
			return {
				mode,
				cursorGuard: isNewestCursor,
				orderBy: (t) => sql`${t.createdAt} DESC, ${t.id} DESC`,
				getCursor: (row) => ({
					ts: row.createdAt.toISOString(),
					id: row.id,
				}),
			};
		default:
			return {
				mode: "blend",
				cursorGuard: isBlendCursor,
				orderBy: (t) => sql`${buildFeedBlendScore(t, pointSql)}, ${t.id}`,
				getCursor: (row) => ({ s: row.feedScore, id: row.id }),
			};
	}
}

// ─── Keyset continuation ───────────────────────────────────────────────────────

/**
 * Builds the WHERE condition that continues pagination past the last seen item
 * for the active ordering. Only authored when a cursor is present; it does NOT
 * re-apply status/radius/FTS filters — the caller's own WHERE already does.
 *
 * Blend and search use the "greater-than the last value, tie-broken by id"
 * pattern; newest uses "older than the last createdAt, tie-broken by id".
 */
export function buildFeedKeysetWhere(
	cursor: FeedCursor | null,
	tsquery: SQL | null,
	pointSql: SQL,
	t: ListingFeedColumns,
): SQL | undefined {
	if (!cursor) return undefined;

	if ("s" in cursor) {
		const score = buildFeedBlendScore(t, pointSql);
		return sql`(${score} > ${cursor.s}) OR (${score} = ${cursor.s} AND ${t.id} > ${cursor.id})`;
	}

	if ("ts" in cursor) {
		const lastSeen = new Date(cursor.ts);
		return or(
			lt(t.createdAt, lastSeen),
			and(eq(t.createdAt, lastSeen), lt(t.id, cursor.id)),
		);
	}

	const rank = sql`ts_rank_cd(${t.searchVector}, ${tsquery})`;
	return sql`(${rank} < ${cursor.r}) OR (${rank} = ${cursor.r} AND ${t.id} > ${cursor.id})`;
}
