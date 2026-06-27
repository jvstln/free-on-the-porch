import { getInitials } from "@free-on-the-porch/shared/utils";
import { useRouter } from "expo-router";
import { LogOut, Settings, Tag, UserCircle } from "lucide-react-native";
import type React from "react";
import { isValidElement, useState } from "react";
import { Pressable } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetTrigger,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";
import { useGlobalStore } from "@/store/global.store";

type Item = { label: string; icon: Icon.Props["as"]; onPress?: () => void };

export const UserMenu = () => {
	const session = authClient.useSession();
	const router = useRouter();
	const setAuthSheetView = useGlobalStore((state) => state.setAuthSheetView);
	const [isOpen, setIsOpen] = useState(false);

	const user = session.data?.user;
	const initials = getInitials(user?.name ?? "");

	const items: Array<Item | React.ReactNode> = [
		{
			label: "My Profile",
			icon: UserCircle,
			onPress: () => router.push("/dashboard/profile"),
		},
		{
			label: "My Listings",
			icon: Tag,
			onPress: () => router.push("/dashboard/listings"),
		},
		{
			label: "Settings",
			icon: Settings,
			onPress: () => router.push("/settings"),
		},
		<Separator key="separator" className="my-3" />,
		{
			label: "Log out",
			icon: LogOut,
			onPress: async () => {
				const toastId = toast.loading("Logging out...");
				try {
					await authClient.signOut();
					toast.success("Logged out successfully", { id: toastId });
					router.replace("/login");
				} catch (err) {
					console.error("Log out failed:", err);
					toast.error("Failed to log out");
				}
			},
		},
	];

	const isMenuItem = (item: (typeof items)[0]): item is Item => {
		return !isValidElement(item);
	};

	const userAvatar = (
		<Avatar>
			<Avatar.Image src={user?.image} />
			<Avatar.Fallback>{initials}</Avatar.Fallback>
		</Avatar>
	);

	if (!user) {
		return (
			<Pressable onPress={() => setAuthSheetView("login")}>
				{userAvatar}
			</Pressable>
		);
	}

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
			<BottomSheetTrigger>{userAvatar}</BottomSheetTrigger>
			<BottomSheetContent>
				<View className="mb-3 flex-row items-center gap-3">
					{userAvatar}
					<View>
						<Text type="body" className="font-semibold text-foreground">
							{user.name}
						</Text>
						<Text type="body-sm" className="text-muted-foreground">
							Member
						</Text>
					</View>
				</View>
				<Separator className="mb-3" />

				{/* Nav items */}
				<View className="gap-1">
					{items.map((item) => {
						if (!isMenuItem(item)) return item;

						return (
							<Button
								key={item.label}
								appearance={"ghost"}
								color={"neutral"}
								className="justify-start"
								onPress={() => {
									item.onPress?.();
									setIsOpen(false);
								}}
							>
								<Icon as={item.icon} className="" />
								{item.label}
							</Button>
						);
					})}
				</View>
			</BottomSheetContent>
		</BottomSheet>
	);
};
