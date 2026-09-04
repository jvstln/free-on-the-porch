import { ListingStatusSchema } from "@free-on-the-porch/shared/schemas";
import {
	and,
	inArray,
	isNotNull,
	isNull,
	notInArray,
	or,
	sql,
} from "drizzle-orm";
import {
	check,
	customType,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps } from "./common";
import {
	listingCategoryEnum,
	listingConditionEnum,
	listingStatusEnum,
} from "./enums";

export interface Point {
	lat: number;
	lng: number;
}

// Custom Drizzle type bridging JS { lat, lng } objects and PostGIS
// geography(Point, 4326) columns. This is what enables geospatial queries
// (ST_DWithin, <->, ST_Distance) in the listing service's findNearby().
//
// - toDriver: serializes to WKT text, e.g. "SRID=4326;POINT(-0.36 51.47)".
// - fromDriver: Postgres may return EWKB (hex binary) OR WKT text depending
//   on the driver/query. We try EWKB hex parsing first (buf starts "01"),
//   then fall back to a WKT POINT(...) regex. On any failure we degrade to
//   a neutral { lat: 0, lng: 0 } rather than throwing.
export const geographyPoint = customType<{
	data: Point;
	driverData: string;
}>({
	dataType() {
		return "geography(Point, 4326)";
	},
	toDriver(value: Point) {
		return `SRID=4326;POINT(${value.lng} ${value.lat})`;
	},
	fromDriver(value: string) {
		if (!value) return { lat: 0, lng: 0 };
		// EWKB binary format: first bytes start with "01" when hex-encoded.
		if (value.startsWith("01")) {
			try {
				const buffer = Buffer.from(value, "hex");
				const isLittleEndian = buffer.readUInt8(0) === 1;
				const type = isLittleEndian
					? buffer.readUInt32LE(1)
					: buffer.readUInt32BE(1);
				// 0x20000000 flag indicates an SRID is embedded in the WKB.
				const hasSRID = (type & 0x20000000) !== 0;
				const coordsOffset = hasSRID ? 9 : 5;
				if (buffer.length >= coordsOffset + 16) {
					const lng = isLittleEndian
						? buffer.readDoubleLE(coordsOffset)
						: buffer.readDoubleBE(coordsOffset);
					const lat = isLittleEndian
						? buffer.readDoubleLE(coordsOffset + 8)
						: buffer.readDoubleBE(coordsOffset + 8);
					return { lat, lng };
				}
			} catch {
				// Fallback to text parsing
			}
		}
		const match = value.match(/POINT\((?<lng>-?[\d.]+) (?<lat>-?[\d.]+)\)/i);
		if (match?.groups?.lat && match.groups.lng) {
			return {
				lat: Number.parseFloat(match.groups.lat),
				lng: Number.parseFloat(match.groups.lng),
			};
		}
		return { lat: 0, lng: 0 };
	},
});

// Central listing entity. A user posts a free item; other users browse
// nearby items and claim them (see listingClaimRequest + listing.claim in
// the listing service). The status/claim invariants are enforced by the
// CHECK constraint below.
export const listing = pgTable(
	"listing",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: varchar({ length: 80 }).notNull(),
		description: text(),
		category: listingCategoryEnum().notNull(),
		condition: listingConditionEnum().notNull(),
		status: listingStatusEnum().default("AVAILABLE").notNull(),
		// PostGIS geography point; maps { lat, lng } via the geographyPoint type.
		location: geographyPoint().notNull(),
		address: varchar({ length: 200 }),
		expiresAt: timestamp().notNull(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		claimedByUserId: text().references(() => user.id),
		...timestamps,
	},
	(table) => [
		// CHECK invariant: claimedByUserId must be set if and only if status is
		// PICKED_UP or RESERVED. This prevents inconsistent states (e.g. a
		// listing marked RESERVED without a claimant, or claimed but still
		// AVAILABLE).
		check(
			"status_claimed_by_user_id_check",
			or(
				and(
					inArray(table.status, [
						ListingStatusSchema.enum.PICKED_UP,
						ListingStatusSchema.enum.RESERVED,
					]),
					isNotNull(table.claimedByUserId),
				),
				and(
					notInArray(table.status, [
						ListingStatusSchema.enum.PICKED_UP,
						ListingStatusSchema.enum.RESERVED,
					]),
					isNull(table.claimedByUserId),
				),
			) ?? sql`false`,
		),
		// (status, expiresAt) supports the "find active listable listings"
		// query; user/category indexes back up ownership and filter lookups.
		index("listing_status_expiresAt_idx").on(table.status, table.expiresAt),
		index("listing_user_idx").on(table.userId),
		index("listing_category_idx").on(table.category),
	],
);

export const listingClaimRequest = pgTable("listing_claim_request", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	listingId: text()
		.notNull()
		.references(() => listing.id, { onDelete: "cascade" }),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	...timestamps,
});

export const listingImage = pgTable("listing_image", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	url: text().notNull(),
	order: integer().default(0).notNull(),
	listingId: text()
		.notNull()
		.references(() => listing.id, { onDelete: "cascade" }),
	...timestamps,
});

export const comment = pgTable("comment", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	body: varchar({ length: 500 }).notNull(),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	listingId: text()
		.notNull()
		.references(() => listing.id, { onDelete: "cascade" }),
	...timestamps,
});
