import {
	TabList,
	TabSlot,
	Tabs,
	TabTrigger,
	type TabTriggerSlotProps,
} from "expo-router/ui";
import { Compass, MessageSquare, PlusCircle, User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Tab = {
	name: string;
	label: string;
	icon: React.ComponentProps<typeof Icon>["as"];
	href: React.ComponentProps<typeof TabTrigger>["href"];
};

const tabs: Tab[] = [
	{ name: "index", label: "Explore", icon: Compass, href: "/dashboard" },
	{ name: "post", label: "Post", icon: PlusCircle, href: "/dashboard/post" },
	{
		name: "messages",
		label: "Messages",
		icon: MessageSquare,
		href: "/dashboard/messages",
	},
	{ name: "profile", label: "Profile", icon: User, href: "/dashboard/profile" },
];

export default function DashboardLayout() {
	return (
		<Tabs className="flex-1 bg-background">
			<TabSlot />
			<TabList className="flex-row items-center justify-around gap-2 border-border border-t bg-card px-4 pt-2 pb-2">
				{tabs.map((tab) => (
					<TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
						<TabButton {...tab} />
					</TabTrigger>
				))}
			</TabList>
		</Tabs>
	);
}

type TabButtonProps = Omit<TabTriggerSlotProps, "href"> & Tab;

const TabButton = ({
	icon = Compass,
	label,
	isFocused,
	...props
}: TabButtonProps) => {
	return (
		<Button
			{...props}
			className={cn("h-auto w-1/5 grow flex-col p-2")}
			appearance={isFocused ? "soft" : "ghost"}
			color={isFocused ? "primary" : "neutral"}
			feedbackVariant="scale-ripple"
			disabled={props.disabled}
			style={undefined}
		>
			<Icon as={icon} className={cn("size-5")} />
			<Button.Label className="text-xs">{label}</Button.Label>
		</Button>
	);
};
