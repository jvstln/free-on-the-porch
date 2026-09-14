import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import {
	NativeMap,
	WebMapFallback,
} from "@/features/listings/components/listings-map";
import { useFeedListings } from "@/features/listings/hooks/use-listings";
import { useLocation } from "@/hooks/use-location";

export default function MapRoute() {
	const router = useRouter();
	const { coords, getCurrentLocation } = useLocation();

	useEffect(() => {
		if (!coords) {
			getCurrentLocation(false);
		}
	}, [coords, getCurrentLocation]);

	const { data, isLoading } = useFeedListings(
		coords
			? {
					lat: coords.lat,
					lng: coords.lng,
					radiusMeters: 10000,
				}
			: null,
	);

	const listings = data?.listings ?? [];

	const handleSelectPin = (item: { id: string }) => {
		router.push({
			pathname: "/dashboard/listings/[id]",
			params: { id: item.id },
		});
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner size="lg" />
			</View>
		);
	}

	if (listings.length === 0) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Text
					type="h4"
					className="mb-2 text-center font-semibold text-foreground"
				>
					No listings nearby
				</Text>
				<Text type="body-sm" className="text-center text-muted-foreground">
					Try expanding your search radius or check back later.
				</Text>
			</View>
		);
	}

	const MapComponent = Platform.OS === "web" ? WebMapFallback : NativeMap;

	return (
		<View className="flex-1 bg-background">
			<MapComponent
				listings={listings}
				onSelectPin={handleSelectPin}
				centerCoords={coords ?? undefined}
			/>
		</View>
	);
}
