import * as Location from "expo-location";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { formatGeocodedAddress } from "@/hooks/use-location";
import { storage } from "./storage";

export interface UserCoords {
	lat: number;
	lng: number;
}

export interface LocationState {
	coords: UserCoords | null;
	address: string | null;
	isLoading: boolean;
	error: string | null;
	isPermissionDenied: boolean;
	fetchLocation: (
		force?: boolean,
	) => Promise<{ coords: UserCoords; address: string } | null>;
	setCoords: (coords: UserCoords, address?: string) => void;
}

export const useLocationStore = create<LocationState>()(
	persist(
		(set, get) => ({
			coords: null,
			address: null,
			isLoading: false,
			error: null,
			isPermissionDenied: false,

			setCoords: (coords, address) =>
				set({ coords, address: address ?? get().address }),

			fetchLocation: async (force = false) => {
				const state = get();
				// If we already have coords and not forcing a refresh, return cached
				if (state.coords && !force) {
					return { coords: state.coords, address: state.address ?? "" };
				}

				set({ isLoading: true, error: null });

				try {
					const { status } = await Location.requestForegroundPermissionsAsync();
					if (status !== Location.PermissionStatus.GRANTED) {
						set({
							isLoading: false,
							isPermissionDenied: true,
							error:
								"Location permission was denied. Please enable it in device Settings.",
						});
						return null;
					}

					const isEnabled = await Location.hasServicesEnabledAsync();
					if (!isEnabled) {
						set({
							isLoading: false,
							error: "Location services are disabled on your device.",
						});
						return null;
					}

					const position = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.Balanced,
					});

					const coords: UserCoords = {
						lat: Number(position.coords.latitude.toFixed(6)),
						lng: Number(position.coords.longitude.toFixed(6)),
					};

					let address: string | null = null;
					try {
						const [place] = await Location.reverseGeocodeAsync({
							latitude: coords.lat,
							longitude: coords.lng,
						});
						if (place) {
							address = formatGeocodedAddress(place);
						}
					} catch {
						// Geocoding can fail offline; fallback gracefully
					}

					set({
						coords,
						address: address ?? state.address,
						isLoading: false,
						isPermissionDenied: false,
						error: null,
					});

					return { coords, address: address ?? "" };
				} catch (err) {
					const message =
						err instanceof Error
							? err.message
							: "Failed to obtain GPS location.";
					set({ isLoading: false, error: message });
					return null;
				}
			},
		}),
		{
			name: "user-location",
			storage: createJSONStorage(() => storage),
			partialize: (state) => ({
				coords: state.coords,
				address: state.address,
			}),
		},
	),
);
