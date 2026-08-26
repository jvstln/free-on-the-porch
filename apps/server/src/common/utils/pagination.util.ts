/**
 * Reusable cursor-based pagination utilities.
 *
 * Strategy: fetch `limit + 1` rows. If we get more than `limit`, a next page
 * exists — trim the extra row and encode a cursor from the last real item.
 *
 * Cursor format: base64url(JSON(cursorPayload))
 * The cursor payload is generic — each endpoint defines its own cursor shape
 * (e.g. `{ d: number, id: string }` for geo queries, `{ createdAt: string, id: string }` for chronological).
 */

import {
	CursorPaginationSchema,
	type PaginatedResponse,
} from "@free-on-the-porch/shared/schemas";

// ─── Generic Cursor Encoding / Decoding ───────────────────────────────────────

/** Encode any JSON-serializable cursor object to a base64url string safe for query params. */
export function encodeCursor<T extends object>(cursor: T): string {
	return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

/**
 * Decode a cursor string into a typed object.
 *
 * @param raw       The base64url-encoded cursor string.
 * @param validate  A type guard that validates the decoded JSON matches the expected cursor shape.
 *                  If omitted, the decoded JSON is returned as-is (unsafe cast).
 * @returns         The decoded cursor, or `null` if parsing or validation fails.
 *
 * @example
 * ```ts
 * // With a type guard for full type safety:
 * const cursor = decodeCursor(raw, isGeoCursor);
 *
 * // Without a type guard (caller takes responsibility):
 * const cursor = decodeCursor<MyCursor>(raw);
 * ```
 */
export function decodeCursor<T extends object>(
	raw?: string | null,
	validate?: (parsed: unknown) => parsed is T,
): T | null {
	try {
		if (!raw) return null;
		const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
		if (validate) {
			return validate(parsed) ? parsed : null;
		}
		return parsed as T;
	} catch {
		return null;
	}
}

/**
 * Configuration options for paginating responses.
 *
 * @template T The type of the item being paginated.
 */
export type Pagination<T> = {
	/** The type of pagination (currently supports "cursor"). */
	type: "cursor";
	/** The maximum number of items requested per page. */
	limit: number;
	/**
	 * An optional function to extract a custom cursor payload from the last item.
	 * If not provided, it defaults to resolving the item's `id` property.
	 */
	getCursor?: (last: T) => Record<string, unknown>;
};

/**
 * Builds a standardized paginated or single-item response wrapper.
 *
 * For arrays: if the number of items exceeds the limit, it trims the list to the limit
 * and encodes a cursor from the last item.
 * For single items: wraps and returns as-is.
 *
 * @template T The type of the items, which must contain an `id` property.
 * @param data The data item or list of items to wrap.
 * @param pagination The pagination parameters.
 * @returns A standardized response object matching PaginatedResponse format.
 */
export function buildResponse<T extends Record<PropertyKey, unknown>>(
	data: T,
	pagination?: Pagination<T>,
): PaginatedResponse<T>;
export function buildResponse<T extends { id: unknown }>(
	data: T[],
	pagination?: Pagination<T>,
): PaginatedResponse<T[]>;
export function buildResponse<T extends { id: unknown }>(
	data: T | T[],
	_pagination?: Pagination<T>,
): PaginatedResponse<T> | PaginatedResponse<T[]> {
	if (!Array.isArray(data)) {
		return { data } as PaginatedResponse<T>;
	}

	// The default pagination is cursor
	const pagination = _pagination ?? {
		type: "cursor",
		limit: CursorPaginationSchema.shape.limit.parse(undefined),
	};

	const hasNextPage = data.length > pagination.limit;
	const slicedData = hasNextPage ? data.slice(0, pagination.limit) : data;
	const lastItem = slicedData.at(-1);

	let nextCursor: string | null = null;
	if (hasNextPage && lastItem) {
		const cursorObj = pagination.getCursor?.(lastItem) ?? { id: lastItem.id };
		nextCursor = encodeCursor(cursorObj);
	}

	return {
		data: slicedData,
		pagination: { nextCursor },
	};
}
