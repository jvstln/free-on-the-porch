import { Tag } from "lucide-react-native";
import { useRef, useState } from "react";
import { Platform, Pressable } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import type { ListingCardItem } from "./listing-card";

// ─── Native Map Conditionally Loaded ──────────────────────────────────────────

let MapView: any;
let Marker: any;
try {
	if (Platform.OS !== "web") {
		const maps = require("react-native-maps");
		MapView = maps.default;
		Marker = maps.Marker;
	}
} catch (_e) {
	console.log("react-native-maps not loaded");
}

// ─── Web Map Fallback ─────────────────────────────────────────────────────────

export function WebMapFallback({
	listings,
	onSelectPin,
	centerCoords,
}: {
	listings: ListingCardItem[];
	onSelectPin: (item: ListingCardItem) => void;
	centerCoords: { lat: number; lng: number };
}) {
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		setPan({
			x: e.clientX - dragStart.x,
			y: e.clientY - dragStart.y,
		});
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	return (
		<View
			className="relative flex-1 overflow-hidden bg-[#e5e9f0]"
			{...({
				onMouseDown: handleMouseDown,
				onMouseMove: handleMouseMove,
				onMouseUp: handleMouseUp,
				onMouseLeave: handleMouseUp,
			} as any)}
		>
			{/* Grid Map Vector */}
			<View
				className="absolute size-[2000px] select-none"
				style={{
					left: "50%",
					top: "50%",
					transform: [
						{ translateX: pan.x - 1000 },
						{ translateY: pan.y - 1000 },
						{ scale: zoom },
					],
				}}
			>
				{/* Map SVG background */}
				<svg
					width="2000"
					height="2000"
					viewBox="0 0 2000 2000"
					style={{ backgroundColor: "#e5e9f0" }}
				>
					<title>Map Background</title>
					<path
						d="M 0,400 Q 400,350 800,600 T 2000,500 L 2000,0 L 0,0 Z"
						fill="#bcd4e6"
						opacity="0.8"
					/>
					<rect
						x="200"
						y="800"
						width="300"
						height="200"
						rx="15"
						fill="#c2e3bf"
					/>
					<circle cx="1400" cy="1200" r="180" fill="#c2e3bf" />
					<line
						x1="0"
						y1="1000"
						x2="2000"
						y2="1000"
						stroke="#ffffff"
						strokeWidth="24"
					/>
					<line
						x1="0"
						y1="1000"
						x2="2000"
						y2="1000"
						stroke="#d0d6e2"
						strokeWidth="18"
					/>
					<line
						x1="1000"
						y1="0"
						x2="1000"
						y2="2000"
						stroke="#ffffff"
						strokeWidth="24"
					/>
					<line
						x1="1000"
						y1="0"
						x2="1000"
						y2="2000"
						stroke="#d0d6e2"
						strokeWidth="18"
					/>
					<line
						x1="300"
						y1="0"
						x2="300"
						y2="2000"
						stroke="#ffffff"
						strokeWidth="12"
						opacity="0.6"
					/>
					<line
						x1="1700"
						y1="0"
						x2="1700"
						y2="2000"
						stroke="#ffffff"
						strokeWidth="12"
						opacity="0.6"
					/>
					<line
						x1="0"
						y1="400"
						x2="2000"
						y2="400"
						stroke="#ffffff"
						strokeWidth="12"
						opacity="0.6"
					/>
					<line
						x1="0"
						y1="1600"
						x2="2000"
						y2="1600"
						stroke="#ffffff"
						strokeWidth="12"
						opacity="0.6"
					/>
				</svg>

				{/* Map Markers overlay */}
				{listings.map((item, idx) => {
					const angle = (idx * 2 * Math.PI) / listings.length;
					const dist = 250 + idx * 40;
					const posX = 1000 + dist * Math.cos(angle);
					const posY = 1000 + dist * Math.sin(angle);

					return (
						<View
							key={item.id}
							className="absolute items-center justify-center"
							style={{
								left: posX,
								top: posY,
								transform: [{ translateX: -20 }, { translateY: -40 }],
							}}
						>
							<Pressable
								onPress={() => onSelectPin(item)}
								className="size-10 items-center justify-center rounded-full border border-primary bg-card shadow-md active:scale-90"
							>
								{item.images[0]?.url ? (
									<Image
										source={{ uri: item.images[0].url }}
										className="size-8 rounded-full"
										contentFit="cover"
									/>
								) : (
									<Icon as={Tag} className="size-5 text-primary" />
								)}
							</Pressable>
							<View
								className="h-0 w-0 border-t-[8px] border-t-primary border-r-[6px] border-r-transparent border-l-[6px] border-l-transparent"
								style={{ marginTop: -2 }}
							/>
						</View>
					);
				})}
			</View>

			{/* Zoom Controls */}
			<View className="absolute top-24 right-4 gap-2">
				<Pressable
					onPress={() => setZoom((z) => Math.min(2, z + 0.15))}
					className="size-10 items-center justify-center rounded-full border border-border bg-card shadow-md active:bg-muted"
				>
					<Text className="font-bold text-base text-primary">+</Text>
				</Pressable>
				<Pressable
					onPress={() => setZoom((z) => Math.max(0.5, z - 0.15))}
					className="size-10 items-center justify-center rounded-full border border-border bg-card shadow-md active:bg-muted"
				>
					<Text className="font-bold text-base text-primary">-</Text>
				</Pressable>
			</View>

			{/* Center FAB */}
			<Pressable
				onPress={() => {
					setPan({ x: 0, y: 0 });
					setZoom(1);
				}}
				className="absolute right-4 bottom-4 rounded-full border border-primary bg-primary px-4 py-2.5 shadow-md active:opacity-90"
			>
				<Text
					type="body-xs"
					className="font-bold text-white uppercase tracking-wider"
				>
					Recenter
				</Text>
			</Pressable>

			{/* Drag helper label */}
			<View className="absolute top-24 left-4 rounded-full bg-black/60 px-3.5 py-1.5">
				<Text type="body-xs" className="font-medium text-white">
					Drag to pan neighborhood map
				</Text>
			</View>
		</View>
	);
}

// ─── Native Map Component ─────────────────────────────────────────────────────

export function NativeMap({
	listings,
	onSelectPin,
	centerCoords,
}: {
	listings: ListingCardItem[];
	onSelectPin: (item: ListingCardItem) => void;
	centerCoords: { lat: number; lng: number };
}) {
	const mapRef = useRef<any>(null);

	const handleCenter = () => {
		mapRef.current?.animateToRegion({
			latitude: centerCoords.lat,
			longitude: centerCoords.lng,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		});
	};

	return (
		<View className="relative flex-1">
			<MapView
				ref={mapRef}
				style={{ flex: 1 }}
				initialRegion={{
					latitude: centerCoords.lat,
					longitude: centerCoords.lng,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				}}
			>
				{listings.map((item, idx) => {
					const angle = (idx * 2 * Math.PI) / listings.length;
					const distOffset = 0.005 + idx * 0.001;
					const coordinate = {
						latitude: centerCoords.lat + distOffset * Math.sin(angle),
						longitude: centerCoords.lng + distOffset * Math.cos(angle),
					};

					return (
						<Marker
							key={item.id}
							coordinate={coordinate}
							onPress={() => onSelectPin(item)}
						>
							<View className="items-center">
								<View className="size-10 items-center justify-center rounded-full border border-primary bg-card shadow-md">
									{item.images[0]?.url ? (
										<Image
											source={{ uri: item.images[0].url }}
											className="size-8 rounded-full"
											contentFit="cover"
										/>
									) : (
										<Icon as={Tag} className="size-5 text-primary" />
									)}
								</View>
								<View
									className="h-0 w-0 border-t-[8px] border-t-primary border-r-[6px] border-r-transparent border-l-[6px] border-l-transparent"
									style={{ marginTop: -2 }}
								/>
							</View>
						</Marker>
					);
				})}
			</MapView>

			{/* Center FAB */}
			<Pressable
				onPress={handleCenter}
				className="absolute right-4 bottom-4 rounded-full border border-primary bg-primary px-4 py-2.5 shadow-md active:opacity-90"
			>
				<Text
					type="body-xs"
					className="font-bold text-white uppercase tracking-wider"
				>
					Recenter
				</Text>
			</Pressable>
		</View>
	);
}

// ─── Export Optional Map Components ───────────────────────────────────────────

export { MapView, Marker };
