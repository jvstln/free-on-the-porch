import {
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
		if (value.startsWith("01")) {
			try {
				const buffer = Buffer.from(value, "hex");
				const isLittleEndian = buffer.readUInt8(0) === 1;
				const type = isLittleEndian
					? buffer.readUInt32LE(1)
					: buffer.readUInt32BE(1);
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
		location: geographyPoint().notNull(),
		address: varchar({ length: 200 }),
		expiresAt: timestamp({ mode: "date" }).notNull(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		index("listing_status_expiresAt_idx").on(table.status, table.expiresAt),
	],
);

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
