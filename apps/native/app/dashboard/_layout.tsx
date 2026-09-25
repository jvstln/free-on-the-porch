import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	TabList,
	TabSlot,
	Tabs,
	TabTrigger,
	type TabTriggerSlotProps,
} from "expo-router/ui";
import {
	House,
	MapPin,
	MessageCircle,
	Plus,
	UserRound,
} from "lucide-react-native";
import type React from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { getIsPublicPage } from "@/features/auth/auth.util";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/global.store";

type Tab = {
	name: string;
	label: string;
	icon: React.ComponentProps<typeof Icon>["as"];
	href: Href;
};

const tabs: Tab[] = [
	{
		name: "index",
		label: "Feed",
		icon: House,
		href: "/dashboard/listings",
	},
	{
		name: "map",
		label: "Map",
		icon: MapPin,
		href: "/dashboard/map",
	},
	{
		name: "listings/new",
		label: "Post",
		icon: Plus,
		href: "/dashboard/listings/new",
	},
	{
		name: "messages",
		label: "Messages",
		icon: MessageCircle,
		href: "/dashboard/messages",
	},
	{
		name: "profile",
		label: "Profile",
		icon: UserRound,
		href: "/dashboard/profile",
	},
];

export default function DashboardLayout() {
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const setAuthSheetView = useGlobalStore((state) => state.setAuthSheetView);
	const router = useRouter();

	const isAuthenticated = !!session.data;

	return (
		<Tabs className="flex-1 bg-background">
			<TabSlot />
			<TabList
				className="flex-row items-center justify-around border-border border-t bg-card px-2 pt-1.5"
				style={{ paddingBottom: Math.max(insets.bottom, 6) }}
			>
				{tabs.map((tab) => {
					const isPublic = getIsPublicPage(tab.href as string);
					const isAllowed = isPublic || isAuthenticated;

					// Elevated Center "Post" Button
					if (tab.name === "listings/new") {
						return (
							<Pressable
								key={tab.name}
								onPress={() => {
									if (!isAllowed) {
										setAuthSheetView("login");
									} else {
										router.push(tab.href);
									}
								}}
								className="-top-4 mx-1 items-center justify-center active:scale-95"
								accessibilityLabel="Post new item"
							>
								<View className="-top-2 size-14 items-center justify-center rounded-full bg-primary shadow-black/15 shadow-md">
									<Icon as={Plus} className="size-6 text-primary-foreground" />
								</View>
								<Text type="body-xs" className="mt-1 font-bold text-primary">
									Post
								</Text>
							</Pressable>
						);
					}

					if (!isAllowed) {
						return (
							<TabButton
								key={tab.name}
								{...tab}
								isFocused={false}
								onPress={() => setAuthSheetView("login")}
							/>
						);
					}

					return (
						<TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
							<TabButton {...tab} />
						</TabTrigger>
					);
				})}
			</TabList>
		</Tabs>
	);
}

type TabButtonProps = Partial<Omit<TabTriggerSlotProps, "href">> & Tab;

const TabButton = ({
	icon = House,
	label,
	isFocused,
	href,
	onPress,
	...props
}: TabButtonProps) => {
	return (
		<Button
			{...props}
			onPress={onPress ?? undefined}
			style={{ flexDirection: "column" }}
			className="h-auto w-0 flex-1 items-center gap-1 p-1.5"
			appearance="ghost"
			color={isFocused ? "primary" : "default"}
			feedbackVariant="scale-ripple"
			disabled={props.disabled}
		>
			<Icon
				as={icon}
				className={cn(
					"size-5",
					isFocused ? "text-primary" : "text-muted-foreground",
				)}
			/>
			<Button.Label
				className={cn(
					"text-[10px]",
					isFocused
						? "font-bold text-primary"
						: "font-medium text-muted-foreground",
				)}
			>
				{label}
			</Button.Label>
			<View
				className={cn(
					"h-1 w-4 rounded-full bg-primary",
					isFocused ? "opacity-100" : "opacity-0",
				)}
			/>
		</Button>
	);
};
