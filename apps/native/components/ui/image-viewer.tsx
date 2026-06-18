import { X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	FlatList,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StatusBar,
	StyleSheet,
	type ViewToken,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
	images: string[];
	visible: boolean;
	onClose: () => void;
	initialIndex?: number;
};

export function ImageViewer({
	images,
	visible,
	onClose,
	initialIndex = 0,
}: Props) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const flatListRef = useRef<FlatList>(null);

	// Sync current index on open
	useEffect(() => {
		if (visible) {
			setCurrentIndex(initialIndex);
			// Scroll FlatList to initial index
			setTimeout(() => {
				flatListRef.current?.scrollToIndex({
					index: initialIndex,
					animated: false,
				});
			}, 50);
		}
	}, [visible, initialIndex]);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0]?.index !== null) {
				setCurrentIndex(viewableItems[0].index ?? 0);
			}
		},
	);

	const viewabilityConfig = useRef({
		viewAreaCoveragePercentThreshold: 50,
	});

	if (!images || images.length === 0) return null;

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="fade"
			onRequestClose={onClose}
		>
			<StatusBar barStyle="light-content" backgroundColor="#000" />
			<View className="flex-1 bg-black">
				{/* Top Header Actions */}
				<View className="absolute top-12 right-0 left-0 z-50 flex-row items-center justify-between px-5">
					<Pressable
						onPress={onClose}
						className="size-10 items-center justify-center rounded-full bg-black/50 active:opacity-75"
					>
						<Icon as={X} className="size-6 text-white" />
					</Pressable>
					{images.length > 1 && (
						<View className="rounded-full bg-black/50 px-4 py-1.5">
							<Text type="body-xs" className="font-bold text-white">
								{currentIndex + 1} / {images.length}
							</Text>
						</View>
					)}
					<View className="w-10" /> {/* Spacer */}
				</View>

				{/* Swipeable List */}
				<FlatList
					ref={flatListRef}
					data={images}
					keyExtractor={(item, index) => `${item}-${index}`}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onViewableItemsChanged={onViewableItemsChanged.current}
					viewabilityConfig={viewabilityConfig.current}
					getItemLayout={(_, index) => ({
						length: SCREEN_WIDTH,
						offset: SCREEN_WIDTH * index,
						index,
					})}
					renderItem={({ item }) => <ZoomableImage uri={item} />}
				/>
			</View>
		</Modal>
	);
}

// ─── Platform Specific Zoomable Image Component ──────────────────────────────

function IosZoomableImage({ uri }: { uri: string }) {
	return (
		<ScrollView
			maximumZoomScale={4}
			minimumZoomScale={1}
			showsHorizontalScrollIndicator={false}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.iosContainer}
			className="bg-black"
			style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
		>
			<Image
				source={{ uri }}
				style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
				contentFit="contain"
			/>
		</ScrollView>
	);
}

function AndroidZoomableImage({ uri }: { uri: string }) {
	const scale = useSharedValue(1);
	const savedScale = useSharedValue(1);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const savedTranslateX = useSharedValue(0);
	const savedTranslateY = useSharedValue(0);

	const pinchGesture = Gesture.Pinch()
		.onUpdate((event) => {
			scale.value = savedScale.value * event.scale;
		})
		.onEnd(() => {
			if (scale.value < 1) {
				scale.value = withTiming(1);
				savedScale.value = 1;
				translateX.value = withTiming(0);
				translateY.value = withTiming(0);
				savedTranslateX.value = 0;
				savedTranslateY.value = 0;
			} else if (scale.value > 4) {
				scale.value = withTiming(4);
				savedScale.value = 4;
			} else {
				savedScale.value = scale.value;
			}
		});

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			if (scale.value > 1) {
				translateX.value = savedTranslateX.value + event.translationX;
				translateY.value = savedTranslateY.value + event.translationY;
			}
		})
		.onEnd(() => {
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		});

	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			if (scale.value > 1) {
				scale.value = withTiming(1);
				savedScale.value = 1;
				translateX.value = withTiming(0);
				translateY.value = withTiming(0);
				savedTranslateX.value = 0;
				savedTranslateY.value = 0;
			} else {
				scale.value = withTiming(2.5);
				savedScale.value = 2.5;
			}
		});

	const composedGesture = Gesture.Simultaneous(
		Gesture.Exclusive(doubleTapGesture, pinchGesture),
		panGesture,
	);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value },
				{ scale: scale.value },
			],
		};
	});

	return (
		<GestureDetector gesture={composedGesture}>
			<View
				style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
				className="items-center justify-center overflow-hidden bg-black"
			>
				<Animated.View style={[styles.androidWrapper, animatedStyle]}>
					<Image
						source={{ uri }}
						style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
						contentFit="contain"
					/>
				</Animated.View>
			</View>
		</GestureDetector>
	);
}

function ZoomableImage({ uri }: { uri: string }) {
	if (Platform.OS === "ios") {
		return <IosZoomableImage uri={uri} />;
	}
	return <AndroidZoomableImage uri={uri} />;
}

const styles = StyleSheet.create({
	iosContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	androidWrapper: {
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		justifyContent: "center",
		alignItems: "center",
	},
});
