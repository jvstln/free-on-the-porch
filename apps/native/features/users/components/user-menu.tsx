import { getInitials } from "@free-on-the-porch/shared/utils";
import { LogOut, Settings, Tag, UserCircle } from "lucide-react-native";
import type React from "react";
import { isValidElement } from "react";
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
import { View } from "@/components/ui/view";
import { OnboardingSheet } from "@/features/auth/components/onboarding-sheet";
import { authClient } from "@/lib/auth-client";

type Item = { label: string; icon: Icon.Props["as"]; onPress?: () => void };

export const UserMenu = () => {
	const session = authClient.useSession();

	const user = session.data?.user;
	const initials = getInitials(user?.name ?? "");

	const items: Array<Item | React.ReactNode> = [
		{ label: "My Profile", icon: UserCircle, onPress: () => {} },
		{ label: "My Listings", icon: Tag, onPress: () => {} },
		{ label: "Settings", icon: Settings, onPress: () => {} },
		<Separator key="separator" className="my-3" />,
		{ label: "Log out", icon: LogOut, onPress: () => {} },
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
			<OnboardingSheet>
				<Pressable>{userAvatar}</Pressable>
			</OnboardingSheet>
		);
	}

	return (
		<BottomSheet>
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
								onPress={item.onPress}
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
