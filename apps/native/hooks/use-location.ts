import type * as Location from "expo-location";
import { useCallback } from "react";
import { useLocationStore } from "@/store/location.store";

export interface GeoLocationResult {
	location: { lat: number; lng: number };
	address: string;
}

export function formatGeocodedAddress(
	place: Location.LocationGeocodedAddress,
): string {
	// 1. Street and house/building number (if present)
	const streetLine =
		place.streetNumber && place.street
			? `${place.streetNumber} ${place.street}`
			: place.street || place.name || "";

	// 2. City, district, or town
	const locality = place.city || place.subregion || place.district || "";

	// 3. State / Province / Country
	const stateOrCountry = place.region || place.country || "";

	// If streetLine is just a duplicate of locality or region, omit it
	const validStreet =
		streetLine &&
		streetLine.toLowerCase() !== locality.toLowerCase() &&
		streetLine.toLowerCase() !== stateOrCountry.toLowerCase()
			? streetLine
			: "";

	// Build clean, standard human-readable address: "123 Main St, Maplewood, NJ"
	const segments = [validStreet, locality, stateOrCountry].filter(Boolean);

	if (segments.length > 0) {
		return segments.join(", ");
	}

	// Fallback to formattedAddress if available (e.g. on Android)
	if (place.formattedAddress) {
		return place.formattedAddress;
	}

	return place.name || "Current Location";
}

export function useLocation() {
	const coords = useLocationStore((s) => s.coords);
	const address = useLocationStore((s) => s.address);
	const isLoading = useLocationStore((s) => s.isLoading);
	const error = useLocationStore((s) => s.error);
	const isPermissionDenied = useLocationStore((s) => s.isPermissionDenied);
	const fetchLocation = useLocationStore((s) => s.fetchLocation);

	const getCurrentLocation = useCallback(
		async (force = true): Promise<GeoLocationResult | null> => {
			const res = await fetchLocation(force);
			if (!res) {
				return null;
			}
			return { location: res.coords, address: res.address };
		},
		[fetchLocation],
	);

	return {
		coords,
		address,
		isLoading,
		error,
		isPermissionDenied,
		getCurrentLocation,
	};
}
