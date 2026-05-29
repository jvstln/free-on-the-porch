import React, { useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { ScrollView, View, SafeAreaView } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Compass, ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";

// Absolute local file URIs for high-quality generated assets
const IMAGES = {
	vintageDresser: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/vintage_dresser_1780092578260.png",
	monsteraPlant: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/monstera_plant_1780092596085.png",
	bookStack: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/book_stack_1780092616112.png",
	kitchenware: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/kitchenware_set_1780092636296.png",
	decorJars: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/decor_jars_1780092651840.png",
	oakTable: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/oak_table_1780092667622.png",
	ceramicBowls: "file:///C:/Users/Jvstln/.gemini/antigravity-ide/brain/0612514b-d3dc-485f-9030-e7bffd3bf88f/ceramic_bowls_1780092681523.png",
};

const CATEGORIES = ["All Items", "Furniture", "Plants", "Books", "Kitchen", "Decor"];

const DashboardIndex = () => {
	const [activeTab, setActiveTab] = useState("Feed");
	const [activeCategory, setActiveCategory] = useState("All Items");

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Top Header */}
			<View className="flex-row items-center justify-between px-5 py-4">
				<View className="flex-row items-center gap-2">
					<Icon as={MapPin} className="text-primary size-6" />
					<Text className="text-2xl font-bold text-primary">Free on the Porch</Text>
				</View>
				<TouchableOpacity className="p-1">
					<Icon as={Search} className="text-[#414942] size-6" />
				</TouchableOpacity>
			</View>

			<ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
				{/* Nearby indicator and Feed/Map toggle */}
				<View className="flex-row items-center justify-between bg-[#f5f4ef] rounded-2xl p-3 mb-6">
					<View className="flex-row items-center gap-2">
						<Icon as={Compass} className="text-[#414942] size-5" />
						<Text className="text-sm text-[#414942] font-medium">
							Nearby:{" "}
							<Text className="text-primary font-bold">Maplewood</Text>
						</Text>
					</View>
					
					{/* Toggle Control */}
					<View className="flex-row bg-[#efeee9] rounded-full p-1">
						{["Feed", "Map"].map((tab) => {
							const isActive = activeTab === tab;
							return (
								<Pressable
									key={tab}
									onPress={() => setActiveTab(tab)}
									className={cn(
										"px-4 py-1.5 rounded-full transition-all duration-200",
										isActive ? "bg-primary" : "bg-transparent"
									)}
								>
									<Text
										className={cn(
											"text-xs font-bold",
											isActive ? "text-white" : "text-[#414942]"
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
					className="flex-row mb-6 -mx-4 px-4"
					contentContainerStyle={{ gap: 10 }}
				>
					{CATEGORIES.map((category) => {
						const isActive = activeCategory === category;
						return (
							<Pressable
								key={category}
								onPress={() => setActiveCategory(category)}
								className={cn(
									"px-4 py-2 rounded-full border transition-all duration-200",
									isActive
										? "bg-[#e1ffe5] border-primary/20"
										: "bg-[#efeee9] border-transparent"
								)}
							>
								<Text
									className={cn(
										"text-xs font-semibold",
										isActive ? "text-primary" : "text-[#414942]"
									)}
								>
									{category}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				{/* Featured Full-Width Card */}
				<Card className="p-0 bg-white border border-[#efeee9] overflow-hidden rounded-2xl mb-6 shadow-sm">
					<View className="relative w-full h-56">
						<Image
							source={{ uri: IMAGES.vintageDresser }}
							className="w-full h-full"
							contentFit="cover"
						/>
						{/* Porch badge */}
						<View className="absolute top-3 left-3 bg-[#fed2a2]/90 px-3 py-1 rounded-full border border-secondary/20">
							<Text className="text-[10px] font-bold text-secondary">
								Porch Pick-up
							</Text>
						</View>
					</View>
					<View className="p-4">
						<Text className="text-xl font-bold text-[#1b1c19] mb-1">
							Vintage MCM Dresser
						</Text>
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center gap-1">
								<Icon as={MapPin} className="text-secondary size-3.5" />
								<Text className="text-xs text-secondary font-semibold">
									0.4 miles away
								</Text>
							</View>
							<Text className="text-xs text-[#414942] font-semibold">
								Maplewood
							</Text>
						</View>
					</View>
				</Card>

				{/* Two-Column Masonry/Grid of Items */}
				<View className="flex-row gap-4 mb-8">
					{/* Left Column */}
					<View className="flex-1 gap-4">
						{/* Item 1 */}
						<Card className="p-0 bg-white border border-[#efeee9] overflow-hidden rounded-2xl shadow-sm">
							<View className="relative w-full h-40">
								<Image
									source={{ uri: IMAGES.monsteraPlant }}
									className="w-full h-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 bg-[#e1ffe5]/90 px-3 py-1 rounded-full border border-primary/20">
									<Text className="text-[10px] font-bold text-primary">
										Pantry
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text className="text-sm font-bold text-[#1b1c19] mb-1">
									Monstera Deliciosa
								</Text>
								<Text className="text-xs text-[#414942]">
									1.2 miles away
								</Text>
							</View>
						</Card>

						{/* Item 2 */}
						<Card className="p-0 bg-white border border-[#efeee9] overflow-hidden rounded-2xl shadow-sm">
							<View className="relative w-full h-40">
								<Image
									source={{ uri: IMAGES.kitchenware }}
									className="w-full h-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 bg-[#e1ffe5]/90 px-3 py-1 rounded-full border border-primary/20">
									<Text className="text-[10px] font-bold text-primary">
										Pantry
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text className="text-sm font-bold text-[#1b1c19] mb-1">
									Kitchenware Set
								</Text>
								<Text className="text-xs text-[#414942]">
									2.5 miles away
								</Text>
							</View>
						</Card>
					</View>

					{/* Right Column */}
					<View className="flex-1 gap-4">
						{/* Item 1 */}
						<Card className="p-0 bg-white border border-[#efeee9] overflow-hidden rounded-2xl shadow-sm">
							<View className="relative w-full h-48">
								<Image
									source={{ uri: IMAGES.bookStack }}
									className="w-full h-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 bg-[#fed2a2]/90 px-3 py-1 rounded-full border border-secondary/20">
									<Text className="text-[10px] font-bold text-secondary">
										Porch
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text className="text-sm font-bold text-[#1b1c19] mb-1">
									Fiction Book Bundle
								</Text>
								<Text className="text-xs text-[#414942]">
									0.8 miles away
								</Text>
							</View>
						</Card>

						{/* Item 2 */}
						<Card className="p-0 bg-white border border-[#efeee9] overflow-hidden rounded-2xl shadow-sm">
							<View className="relative w-full h-40">
								<Image
									source={{ uri: IMAGES.decorJars }}
									className="w-full h-full"
									contentFit="cover"
								/>
								<View className="absolute top-3 left-3 bg-[#fed2a2]/90 px-3 py-1 rounded-full border border-secondary/20">
									<Text className="text-[10px] font-bold text-secondary">
										Porch
									</Text>
								</View>
							</View>
							<View className="p-3">
								<Text className="text-sm font-bold text-[#1b1c19] mb-1">
									Glass Decor Jars
								</Text>
								<Text className="text-xs text-[#414942]">
									0.3 miles away
								</Text>
							</View>
						</Card>
					</View>
				</View>

				{/* Recently Posted Nearby Section */}
				<View className="mb-10">
					<Text className="text-xl font-bold text-[#1b1c19] mb-4">
						Recently Posted Nearby
					</Text>

					<View className="gap-3">
						{/* Row Item 1 */}
						<Card className="p-3 bg-white border border-[#efeee9] rounded-2xl flex-row items-center justify-between shadow-sm">
							<View className="flex-row items-center gap-3 flex-1">
								<Image
									source={{ uri: IMAGES.oakTable }}
									className="size-16 rounded-xl"
									contentFit="cover"
								/>
								<View className="flex-1 justify-center">
									<Text className="text-sm font-bold text-[#1b1c19] mb-0.5">
										Small Oak Side Table
									</Text>
									<Text className="text-xs text-[#414942] font-semibold">
										0.5 miles <Text className="text-[#c1c9bf]">•</Text> Maple Ave
									</Text>
								</View>
							</View>
							<Icon as={ChevronRight} className="text-[#414942] size-5" />
						</Card>

						{/* Row Item 2 */}
						<Card className="p-3 bg-white border border-[#efeee9] rounded-2xl flex-row items-center justify-between shadow-sm">
							<View className="flex-row items-center gap-3 flex-1">
								<Image
									source={{ uri: IMAGES.ceramicBowls }}
									className="size-16 rounded-xl"
									contentFit="cover"
								/>
								<View className="flex-1 justify-center">
									<Text className="text-sm font-bold text-[#1b1c19] mb-0.5">
										Assorted Ceramic Bowls
									</Text>
									<Text className="text-xs text-[#414942] font-semibold">
										1.1 miles <Text className="text-[#c1c9bf]">•</Text> Oak Street
									</Text>
								</View>
							</View>
							<Icon as={ChevronRight} className="text-[#414942] size-5" />
						</Card>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default DashboardIndex;
