import { Tabs } from "expo-router";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Compass, PlusCircle, MessageSquare, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { cn } from "@/lib/utils";

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	return (
		<View className="flex-row bg-[#FAF9F4] border-t border-[#efeee9] pt-2 pb-6 px-4 justify-around items-center">
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				// Determine icon based on route.name
				let icon = Compass;
				if (route.name === "index") icon = Compass;
				else if (route.name === "post") icon = PlusCircle;
				else if (route.name === "messages") icon = MessageSquare;
				else if (route.name === "profile") icon = User;

				return (
					<Pressable
						key={route.name}
						accessibilityRole="button"
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarTestID}
						onPress={onPress}
						onLongPress={onLongPress}
						className="items-center justify-center flex-1 py-1"
					>
						<View
							className={cn(
								"items-center justify-center rounded-full px-5 py-1.5 mb-1 transition-all duration-200",
								isFocused ? "bg-primary" : "bg-transparent"
							)}
						>
							<Icon
								as={icon}
								className={cn(
									"size-6",
									isFocused ? "text-white" : "text-[#414942]"
								)}
							/>
						</View>
						<Text
							className={cn(
								"text-xs font-semibold tracking-wide",
								isFocused ? "text-primary font-bold" : "text-[#414942]"
							)}
						>
							{String(label)}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

function DashboardLayout() {
	return (
		<Tabs
			tabBar={(props) => <MyTabBar {...props} />}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Explore",
				}}
			/>
			<Tabs.Screen
				name="post"
				options={{
					title: "Post",
				}}
			/>
			<Tabs.Screen
				name="messages"
				options={{
					title: "Messages",
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
				}}
			/>
		</Tabs>
	);
}

export default DashboardLayout;
