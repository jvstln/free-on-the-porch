import type { Href } from "expo-router";
import {
	TabList,
	TabSlot,
	Tabs,
	TabTrigger,
	type TabTriggerSlotProps,
} from "expo-router/ui";
import { Compass, Map, MessageSquare, PlusCircle, User } from "lucide-react-native";
import type React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
		icon: Compass,
		href: "/dashboard/listings",
	},
	{
		name: "map",
		label: "Map",
		icon: Map,
		href: "/dashboard/map",
	},
	{
		name: "listings/new",
		label: "Post",
		icon: PlusCircle,
		href: "/dashboard/listings/new",
	},
	{
		name: "messages",
		label: "Messages",
		icon: MessageSquare,
		href: "/dashboard/messages",
	},
	{ name: "profile", label: "Profile", icon: User, href: "/dashboard/profile" },
];

export default function DashboardLayout() {
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const setAuthSheetView = useGlobalStore((state) => state.setAuthSheetView);

	const isAuthenticated = !!session.data;

	return (
		<Tabs className="flex-1 bg-background">
			<TabSlot />
			<TabList
				className="flex-row items-center justify-around gap-2 border-border border-t bg-card px-4 pt-2"
				style={{ paddingBottom: Math.max(insets.bottom, 8) }}
			>
				{tabs.map((tab) => {
					const isPublic = getIsPublicPage(tab.href as string);
					const isAllowed = isPublic || isAuthenticated;

					if (isAllowed) {
						return (
							<TabTrigger
								key={tab.name}
								name={tab.name}
								href={tab.href}
								asChild
							>
								<TabButton {...tab} />
							</TabTrigger>
						);
					}

					// For private tabs when user is not authenticated:
					// Render the button directly without TabTrigger to prevent any navigation,
					// and show the login sheet when pressed.
					return (
						<TabButton
							key={tab.name}
							{...tab}
							isFocused={false}
							onPress={() => setAuthSheetView("login")}
						/>
					);
				})}
			</TabList>
		</Tabs>
	);
}

type TabButtonProps = Partial<Omit<TabTriggerSlotProps, "href">> & Tab;

const TabButton = ({
	icon = Compass,
	label,
	isFocused,
	href,
	onPress,
	...props
}: TabButtonProps) => {
	const [primaryColor, backgroundColor] = useCSSVariable([
		"--color-primary",
		"--color-background",
	]) as string[];

	return (
		<Button
			{...props}
			onPress={onPress ?? undefined}
			className={cn("h-auto grow flex-col gap-1 p-2")}
			appearance="ghost"
			color={isFocused ? "primary" : "default"}
			feedbackVariant="scale-ripple"
			disabled={props.disabled}
			style={undefined}
		>
			<Icon
				as={icon}
				className={cn("size-6")}
				color={isFocused ? backgroundColor : undefined}
				fill={isFocused ? primaryColor : "transparent"}
			/>
			<Button.Label
				className={cn(
					"text-[10px]",
					isFocused ? "font-semibold" : "font-medium",
				)}
			>
				{label}
			</Button.Label>
		</Button>
	);
};
