import { useRouter } from "expo-router";
import {
	ArrowLeft,
	Bell,
	Info,
	LogOut,
	Map as MapIcon,
	ShieldAlert,
	ShieldCheck,
	Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { authClient } from "@/lib/auth-client";

export function SettingsPage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useToast();

	// Local Settings states (simulation)
	const [nearbyNotifications, setNearbyNotifications] = useState(true);
	const [messageNotifications, setMessageNotifications] = useState(true);
	const [radiusKm, setRadiusKm] = useState("15");

	// Blocked users state
	const [blockedUsers, setBlockedUsers] = useState([
		{ id: "block-1", name: "Spam Neighbor", initials: "SN" },
		{ id: "block-2", name: "Inappropriate Postings", initials: "IP" },
	]);

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			toast.show({
				variant: "success",
				label: "Signed out successfully.",
			});
			router.replace("/login");
		} catch (err) {
			console.error("[Settings] Failed to sign out:", err);
			router.replace("/login");
		}
	};

	const handleDeleteAccount = () => {
		Alert.alert(
			"Delete Account",
			"Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							// Simulate account deletion
							await authClient.signOut();
							toast.show({
								variant: "success",
								label: "Your account has been deleted.",
							});
							router.replace("/login");
						} catch (_err) {
							toast.show({
								variant: "danger",
								label: "Failed to delete account.",
							});
						}
					},
				},
			],
		);
	};

	const handleUnblock = (id: string, name: string) => {
		setBlockedUsers((prev) => prev.filter((user) => user.id !== id));
		toast.show({
			variant: "success",
			label: `${name} has been unblocked.`,
		});
	};

	return (
		<View className="flex-1 bg-background">
			{/* Top Header */}
			<View
				className="flex-row items-center border-border border-b bg-card px-4 py-3"
				style={{ paddingTop: Math.max(insets.top, 12) }}
			>
				<Pressable
					onPress={() => router.back()}
					className="mr-3 active:opacity-75"
				>
					<Icon as={ArrowLeft} className="size-6 text-foreground" />
				</Pressable>
				<Text type="h4" className="font-bold text-foreground">
					Settings
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 16,
					paddingBottom: insets.bottom + 40,
				}}
			>
				{/* Notifications Section */}
				<View className="mb-6">
					<View className="mb-2 flex-row items-center gap-1.5">
						<Icon as={Bell} className="size-4 text-primary" />
						<Text
							type="body-xs"
							className="font-bold text-muted-foreground uppercase tracking-wide"
						>
							Notification Preferences
						</Text>
					</View>

					<Card className="gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
						<View className="flex-row items-center justify-between">
							<View className="flex-1 pr-4">
								<Text type="body-sm" className="font-semibold text-foreground">
									New Nearby Listings
								</Text>
								<Text type="body-xs" className="mt-0.5 text-muted-foreground">
									Notify me when free items are posted near my porch.
								</Text>
							</View>
							<Switch
								value={nearbyNotifications}
								onValueChange={setNearbyNotifications}
							/>
						</View>

						<View className="h-px bg-border/60" />

						<View className="flex-row items-center justify-between">
							<View className="flex-1 pr-4">
								<Text type="body-sm" className="font-semibold text-foreground">
									Message Notifications
								</Text>
								<Text type="body-xs" className="mt-0.5 text-muted-foreground">
									Notify me when a neighbor sends me a message.
								</Text>
							</View>
							<Switch
								value={messageNotifications}
								onValueChange={setMessageNotifications}
							/>
						</View>
					</Card>
				</View>

				{/* Search Radius Preference */}
				<View className="mb-6">
					<View className="mb-2 flex-row items-center gap-1.5">
						<Icon as={MapIcon} className="size-4 text-primary" />
						<Text
							type="body-xs"
							className="font-bold text-muted-foreground uppercase tracking-wide"
						>
							Search Settings
						</Text>
					</View>

					<Card className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
						<View className="flex-1 pr-4">
							<Text type="body-sm" className="font-semibold text-foreground">
								Default Radius
							</Text>
							<Text type="body-xs" className="mt-0.5 text-muted-foreground">
								Set your standard browsing area around Maplewood.
							</Text>
						</View>

						<Select
							value={{ value: radiusKm, label: `${radiusKm} km` }}
							onValueChange={(val) => setRadiusKm(val?.value || "15")}
						>
							<SelectTrigger className="w-28 rounded-xl border-border bg-background">
								<SelectValue placeholder="Select Radius" />
							</SelectTrigger>
							<SelectContent className="rounded-xl border-border">
								<SelectItem value="1" label="1 km" />
								<SelectItem value="5" label="5 km" />
								<SelectItem value="15" label="15 km" />
								<SelectItem value="25" label="25 km" />
							</SelectContent>
						</Select>
					</Card>
				</View>

				{/* Privacy / Block List Section */}
				<View className="mb-6">
					<View className="mb-2 flex-row items-center gap-1.5">
						<Icon as={ShieldAlert} className="size-4 text-primary" />
						<Text
							type="body-xs"
							className="font-bold text-muted-foreground uppercase tracking-wide"
						>
							Privacy & Safety
						</Text>
					</View>

					<Card className="rounded-2xl border border-border bg-card p-4 shadow-sm">
						<Text type="body-sm" className="mb-3 font-semibold text-foreground">
							Blocked Neighbors
						</Text>

						{blockedUsers.length === 0 ? (
							<View className="flex-row items-center gap-2 py-1">
								<Icon as={ShieldCheck} className="size-4 text-primary" />
								<Text
									type="body-xs"
									className="font-medium text-muted-foreground"
								>
									You haven't blocked anyone yet.
								</Text>
							</View>
						) : (
							<View className="gap-3">
								{blockedUsers.map((user) => (
									<View
										key={user.id}
										className="flex-row items-center justify-between"
									>
										<View className="flex-row items-center gap-2.5">
											<View className="size-8 items-center justify-center rounded-full bg-muted">
												<Text className="font-bold text-muted-foreground text-xs">
													{user.initials}
												</Text>
											</View>
											<Text
												type="body-sm"
												className="font-medium text-foreground"
											>
												{user.name}
											</Text>
										</View>
										<Button
											appearance="soft"
											color="neutral"
											size="sm"
											className="rounded-lg px-3 py-1"
											onPress={() => handleUnblock(user.id, user.name)}
										>
											<Button.Label className="font-bold text-xs">
												Unblock
											</Button.Label>
										</Button>
									</View>
								))}
							</View>
						)}
					</Card>
				</View>

				{/* About & Legal Section */}
				<View className="mb-8">
					<View className="mb-2 flex-row items-center gap-1.5">
						<Icon as={Info} className="size-4 text-primary" />
						<Text
							type="body-xs"
							className="font-bold text-muted-foreground uppercase tracking-wide"
						>
							About
						</Text>
					</View>

					<Card className="gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
						<Pressable className="flex-row items-center justify-between py-1 active:opacity-70">
							<Text type="body-sm" className="font-semibold text-foreground">
								Terms of Service
							</Text>
							<Text className="font-semibold text-muted-foreground text-xs">
								→
							</Text>
						</Pressable>

						<View className="h-px bg-border/60" />

						<Pressable className="flex-row items-center justify-between py-1 active:opacity-70">
							<Text type="body-sm" className="font-semibold text-foreground">
								Privacy Policy
							</Text>
							<Text className="font-semibold text-muted-foreground text-xs">
								→
							</Text>
						</Pressable>

						<View className="h-px bg-border/60" />

						<View className="flex-row items-center justify-between py-1">
							<Text type="body-sm" className="font-semibold text-foreground">
								App Version
							</Text>
							<Text type="body-xs" className="font-bold text-muted-foreground">
								1.0.0
							</Text>
						</View>
					</Card>
				</View>

				{/* Destructive Sign Out / Delete Actions */}
				<View className="mb-4 gap-4">
					<Button
						appearance="solid"
						color="primary"
						size="lg"
						className="flex-row items-center justify-center gap-2 rounded-xl py-4"
						onPress={handleSignOut}
					>
						<Icon as={LogOut} className="size-5 text-white" />
						<Button.Label className="font-bold text-base text-white">
							Sign Out
						</Button.Label>
					</Button>

					<Button
						appearance="soft"
						color="destructive"
						size="lg"
						className="flex-row items-center justify-center gap-2 rounded-xl py-4"
						onPress={handleDeleteAccount}
					>
						<Icon as={Trash2} className="size-5" />
						<Button.Label className="font-bold text-base">
							Delete Account
						</Button.Label>
					</Button>
				</View>
			</ScrollView>
		</View>
	);
}
