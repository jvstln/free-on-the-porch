import { ChevronRight, Compass, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { SafeAreaView, ScrollView, View } from "@/components/ui/view";
import { cn } from "@/lib/utils";

// Absolute local file URIs for high-quality generated assets
const IMAGES = {
	vintageDresser:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/vintage_dresser_1780092578260.png",
	monsteraPlant:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/monstera_plant_1780092596085.png",
	bookStack:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/book_stack_1780092616112.png",
	kitchenware:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/kitchenware_set_1780092636296.png",
	decorJars:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/decor_jars_1780092651840.png",
	oakTable:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/oak_table_1780092667622.png",
	ceramicBowls:
		"file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/ceramic_bowls_1780092681523.png",
};

const CATEGORIES = [
	"All Items",
	"Furniture",
	"Plants",
	"Books",
	"Kitchen",
	"Decor",
];

const DashboardIndex = () => {
	const [activeTab, setActiveTab] = useState("Feed");
	const [activeCategory, setActiveCategory] = useState("All Items");

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Header />

			<ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
				{/* Nearby indicator and Feed/Map toggle */}
				<View className="mb-6 flex-row items-center justify-between rounded-2xl bg-[#f5f4ef] p-3">
					<View className="flex-row items-center gap-2">
						<Icon as={Compass} className="size-5 text-[#414942]" />
						<Text type="body-sm" className="font-medium text-[#414942]">
							Nearby: <Text className="font-bold text-primary">Maplewood</Text>
						</Text>
					</View>

					{/* Toggle Control */}
					<View className="flex-row rounded-full bg-[#efeee9] p-1">
						{["Feed", "Map"].map((tab) => {
							const isActive = activeTab === tab;
							return (
								<Pressable
									key={tab}
									onPress={() => setActiveTab(tab)}
									className={cn(
										"rounded-full px-4 py-1.5 transition-all duration-200",
										isActive ? "bg-primary" : "bg-transparent",
									)}
								>
									<Text
										type="body-xs"
										className={cn(
											"font-bold",
											isActive ? "text-white" : "text-[#414942]",
										)}
									>
										{tab}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				{/* Horizontal Scrollable Categories */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="-mx-4 mb-6 flex-row px-4"
					contentContainerStyle={{ gap: 10 }}
				>
					{CATEGORIES.map((category) => {
						const isActive = activeCategory === category;
						return (
							<Pressable
								key={category}
								onPress={() => setActiveCategory(category)}
								className={cn(
									"rounded-full border px-4 py-2 transition-all duration-200",
									isActive
										? "border-primary/20 bg-[#e1ffe5]"
										: "border-transparent bg-[#efeee9]",
								)}
							>
								<Text
									type="body-xs"
									className={cn(
										"font-semibold",
										isActive ? "text-primary" : "text-[#414942]",
									)}
								>
									{category}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				{/* Featured Full-Width Card */}
				<Card className="mb-6 overflow-hidden rounded-2xl border border-[#efeee9] bg-white p-0 shadow-sm">
					<View className="relative h-56 w-full">
						<Image
							source={{ uri: IMAGES.vintageDresser }}
							className="h-full w-full"
							contentFit="cover"
						/>
						{/* Porch badge */}
						<View className="absolute top-3 left-3 rounded-full border border-secondary/20 bg-[#fed2a2]/90 px-3 py-1">
							<Text type="body-xs" className="font-bold text-secondary">
								Porch Pick-up
							</Text>
						</View>
					</View>
					<View className="p-4">
						<Text type="h4" className="mb-1 font-bold text-[#1b1c19]">
							Vintage MCM Dresser
						</Text>
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center gap-1">
								<Icon as={MapPin} className="size-3.5 text-secondary" />
								<Text type="body-xs" className="font-semibold text-secondary">
									0.4 miles away
								</Text>
							</View>
							<Text type="body-xs" className="font-semibold text-[#414942]">
								Maplewood
							</Text>
						</View>
					</View>
				</Card>

				{/* Two-Column Masonry/Grid of Items */}
				<View className="mb-8 flex-row gap-4">
					{/* Left Column */}
					<View className="flex-1 gap-4">
						{/* Item 1 */}
						<Card className="overflow-hidden rounded-2xl border border-[#efeee9] bg-white p-0 shadow-sm">
							<View className="relative h-40 w-full">
								<Image
									source={{ uri: IMAGES.monsteraPlant }}
									className="h-full w-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 rounded-full border border-primary/20 bg-[#e1ffe5]/90 px-3 py-1">
									<Text type="body-xs" className="font-bold text-primary">
										Pantry
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text type="body-sm" className="mb-1 font-bold text-[#1b1c19]">
									Monstera Deliciosa
								</Text>
								<Text type="body-xs" className="text-[#414942]">
									1.2 miles away
								</Text>
							</View>
						</Card>

						{/* Item 2 */}
						<Card className="overflow-hidden rounded-2xl border border-[#efeee9] bg-white p-0 shadow-sm">
							<View className="relative h-40 w-full">
								<Image
									source={{ uri: IMAGES.kitchenware }}
									className="h-full w-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 rounded-full border border-primary/20 bg-[#e1ffe5]/90 px-3 py-1">
									<Text type="body-xs" className="font-bold text-primary">
										Pantry
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text type="body-sm" className="mb-1 font-bold text-[#1b1c19]">
									Kitchenware Set
								</Text>
								<Text type="body-xs" className="text-[#414942]">
									2.5 miles away
								</Text>
							</View>
						</Card>
					</View>

					{/* Right Column */}
					<View className="flex-1 gap-4">
						{/* Item 1 */}
						<Card className="overflow-hidden rounded-2xl border border-[#efeee9] bg-white p-0 shadow-sm">
							<View className="relative h-48 w-full">
								<Image
									source={{ uri: IMAGES.bookStack }}
									className="h-full w-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 rounded-full border border-secondary/20 bg-[#fed2a2]/90 px-3 py-1">
									<Text type="body-xs" className="font-bold text-secondary">
										Porch
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text type="body-sm" className="mb-1 font-bold text-[#1b1c19]">
									Fiction Book Bundle
								</Text>
								<Text type="body-xs" className="text-[#414942]">
									0.8 miles away
								</Text>
							</View>
						</Card>

						{/* Item 2 */}
						<Card className="overflow-hidden rounded-2xl border border-[#efeee9] bg-white p-0 shadow-sm">
							<View className="relative h-40 w-full">
								<Image
									source={{ uri: IMAGES.decorJars }}
									className="h-full w-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 rounded-full border border-secondary/20 bg-[#fed2a2]/90 px-3 py-1">
									<Text type="body-xs" className="font-bold text-secondary">
										Porch
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text type="body-sm" className="mb-1 font-bold text-[#1b1c19]">
									Glass Decor Jars
								</Text>
								<Text type="body-xs" className="text-[#414942]">
									0.3 miles away
								</Text>
							</View>
						</Card>
					</View>
				</View>

				{/* Recently Posted Nearby Section */}
				<View className="mb-10">
					<Text type="h4" className="mb-4 font-bold text-[#1b1c19]">
						Recently Posted Nearby
					</Text>

					<View className="gap-3">
						{/* Row Item 1 */}
						<Card className="flex-row items-center justify-between rounded-2xl border border-[#efeee9] bg-white p-3 shadow-sm">
							<View className="flex-1 flex-row items-center gap-3">
								<Image
									source={{ uri: IMAGES.oakTable }}
									className="size-16 rounded-xl"
									contentFit="cover"
								/>
								<View className="flex-1 justify-center">
									<Text
										type="body-sm"
										className="mb-0.5 font-bold text-[#1b1c19]"
									>
										Small Oak Side Table
									</Text>
									<Text type="body-xs" className="font-semibold text-[#414942]">
										0.5 miles <Text className="text-[#c1c9bf]">•</Text> Maple
										Ave
									</Text>
								</View>
							</View>
							<Icon as={ChevronRight} className="size-5 text-[#414942]" />
						</Card>

						{/* Row Item 2 */}
						<Card className="flex-row items-center justify-between rounded-2xl border border-[#efeee9] bg-white p-3 shadow-sm">
							<View className="flex-1 flex-row items-center gap-3">
								<Image
									source={{ uri: IMAGES.ceramicBowls }}
									className="size-16 rounded-xl"
									contentFit="cover"
								/>
								<View className="flex-1 justify-center">
									<Text
										type="body-sm"
										className="mb-0.5 font-bold text-[#1b1c19]"
									>
										Assorted Ceramic Bowls
									</Text>
									<Text type="body-xs" className="font-semibold text-[#414942]">
										1.1 miles <Text className="text-[#c1c9bf]">•</Text> Oak
										Street
									</Text>
								</View>
							</View>
							<Icon as={ChevronRight} className="size-5 text-[#414942]" />
						</Card>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default DashboardIndex;
