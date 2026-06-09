import type {
	CreateListingDto,
	NearbyQueryDto,
	UpdateListingDto,
} from "@free-on-the-porch/shared/schemas";
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class ListingService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, data: CreateListingDto, imageUrls: string[]) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // listings expire in 7 days

		return this.prisma.listing.create({
			data: {
				...data,
				userId,
				expiresAt,
				images: {
					create: imageUrls.map((url, i) => ({ url, order: i })),
				},
			},
			include: {
				images: true,
				user: { select: { id: true, name: true, image: true } },
			},
		});
	}

	async findNearby(query: NearbyQueryDto) {
		const { lat, lng, radiusKm, category, limit, cursor } = query;

		// Haversine via raw SQL — works without PostGIS
		const radiusMeters = radiusKm * 1000;

		const listings = await this.prisma.$queryRaw`
      SELECT
        l.*,
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(l.lat)) *
            cos(radians(l.lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(l.lat))
          )
        ) AS distance_meters
      FROM listing l
      WHERE
        l.status = 'AVAILABLE'
        AND l."expiresAt" > NOW()
        ${category ? this.prisma.$queryRaw`AND l.category = ${category}` : this.prisma.$queryRaw``}
      HAVING
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(l.lat)) *
            cos(radians(l.lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(l.lat))
          )
        ) <= ${radiusMeters}
      ORDER BY distance_meters ASC
      LIMIT ${limit}
    `;

		return listings;
	}

	async findOne(id: string) {
		const listing = await this.prisma.listing.findUnique({
			where: { id },
			include: {
				images: { orderBy: { order: "asc" } },
				user: { select: { id: true, name: true, image: true } },
				comments: {
					include: { user: { select: { id: true, name: true, image: true } } },
					orderBy: { createdAt: "desc" },
					take: 20,
				},
			},
		});

		if (!listing) throw new NotFoundException("Listing not found");
		return listing;
	}

	async update(id: string, userId: string, data: UpdateListingDto) {
		const listing = await this.prisma.listing.findUnique({ where: { id } });
		if (!listing) throw new NotFoundException("Listing not found");
		if (listing.userId !== userId) throw new ForbiddenException();

		return this.prisma.listing.update({
			where: { id },
			data,
			include: { images: true },
		});
	}

	async remove(id: string, userId: string) {
		const listing = await this.prisma.listing.findUnique({ where: { id } });
		if (!listing) throw new NotFoundException("Listing not found");
		if (listing.userId !== userId) throw new ForbiddenException();

		await this.prisma.listing.delete({ where: { id } });
		return { success: true };
	}

	async findByUser(userId: string) {
		return this.prisma.listing.findMany({
			where: { userId },
			include: { images: { orderBy: { order: "asc" }, take: 1 } },
			orderBy: { createdAt: "desc" },
		});
	}
}
