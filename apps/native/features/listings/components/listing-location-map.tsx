import { MapPin } from "lucide-react-native";
import { Platform } from "react-native";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

// Dynamically require react-native-maps on native platforms to prevent web crash
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;

try {
	if (Platform.OS !== "web") {
		const maps = require("react-native-maps");
		MapView = maps.default;
		Marker = maps.Marker;
		Circle = maps.Circle;
	}
} catch (_e) {
	console.log("react-native-maps not loaded in ListingLocationMap");
}

type Props = {
	location: { lat: number; lng: number } | null;
	address: string | null;
};

export function ListingLocationMap({ location, address }: Props) {
	const defaultCoords = { lat: 40.73061, lng: -73.935242 }; // Default coords
	const lat = location?.lat ?? defaultCoords.lat;
	const lng = location?.lng ?? defaultCoords.lng;

	if (Platform.OS !== "web" && MapView) {
		return (
			<Card className="relative h-48 w-full overflow-hidden rounded-2xl border border-border bg-muted p-0 shadow-sm">
				<MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: lat,
						longitude: lng,
						latitudeDelta: 0.015,
						longitudeDelta: 0.015,
					}}
					scrollEnabled={false}
					zoomEnabled={false}
					pitchEnabled={false}
					rotateEnabled={false}
				>
					{/* Draw a subtle circular estimation of the area instead of exact house location for privacy */}
					<Circle
						center={{ latitude: lat, longitude: lng }}
						radius={200} // 200 meters privacy estimation radius
						strokeWidth={2}
						strokeColor="#316342"
						fillColor="rgba(49, 99, 66, 0.15)"
					/>
					<Marker coordinate={{ latitude: lat, longitude: lng }}>
						<View className="items-center justify-center size-8 rounded-full bg-primary/20 border border-primary">
							<View className="size-3 rounded-full bg-primary" />
						</View>
					</Marker>
				</MapView>

				{/* Location overlay */}
				<View className="absolute right-3 bottom-3 left-3 flex-row items-center gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-sm">
					<Icon as={MapPin} className="size-5 text-primary" />
					<Text type="body-xs" className="flex-1 font-semibold text-foreground">
						{address || "Maplewood Neighborhood"}
					</Text>
				</View>
			</Card>
		);
	}

	// Web Fallback: Render a beautiful vector map style or a mocked visual representing the area
	return (
		<Card className="relative h-48 w-full overflow-hidden rounded-2xl border border-border bg-[#e5e9f0] p-0 shadow-sm">
			{/* Grid Map SVG background */}
			<View className="absolute inset-0 select-none opacity-90">
				<svg width="100%" height="100%" viewBox="0 0 400 200" style={{ backgroundColor: "#e5e9f0" }}>
					<title>Estimated Area Map</title>
					<rect x="0" y="0" width="400" height="200" fill="#e5e9f0" />
					<circle cx="200" cy="100" r="60" fill="#bcd4e6" opacity="0.6" />
					<circle cx="200" cy="100" r="40" fill="#c2e3bf" opacity="0.8" />
					<line x1="0" y1="100" x2="400" y2="100" stroke="#ffffff" strokeWidth="6" />
					<line x1="0" y1="100" x2="400" y2="100" stroke="#d0d6e2" strokeWidth="4" />
					<line x1="200" y1="0" x2="200" y2="200" stroke="#ffffff" strokeWidth="6" />
					<line x1="200" y1="0" x2="200" y2="200" stroke="#d0d6e2" strokeWidth="4" />
				</svg>
			</View>

			{/* Center Map PIN Marker */}
			<View className="absolute top-[40%] left-[47%] items-center justify-center">
				<View className="size-10 items-center justify-center rounded-full bg-primary/20 border border-primary">
					<Icon as={MapPin} className="size-5 text-primary" />
				</View>
			</View>

			{/* Location overlay */}
			<View className="absolute right-3 bottom-3 left-3 flex-row items-center gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-sm">
				<Icon as={MapPin} className="size-5 text-primary" />
				<Text type="body-xs" className="flex-1 font-semibold text-foreground">
					{address || "Maplewood Neighborhood"}
				</Text>
			</View>
		</Card>
	);
}
