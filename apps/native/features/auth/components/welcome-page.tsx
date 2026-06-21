import porchImage from "@free-on-the-porch/shared/assets/images/porch.jpg";
import { Link, Redirect } from "expo-router";
import {
	ArrowRightIcon,
	HeartIcon,
	LeafIcon,
	TruckIcon,
	UsersIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import { LogoContained } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImageBackground } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "@/components/ui/view";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/global.store";

export function WelcomePage() {
	const isFirstLaunch = useGlobalStore((state) => state.isFirstLaunch);
	const setIsFirstLaunch = useGlobalStore((state) => state.setIsFirstLaunch);

	useEffect(() => {
		setIsFirstLaunch(false);
	}, [setIsFirstLaunch]);

	// Users are only meant to see this screen only once when the app is launched for the first time
	if (!isFirstLaunch) {
		return <Redirect href="/dashboard" />;
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="flex-1 justify-between px-5 pt-4 pb-8">
				{/* Top Hero Banner */}
				<View className="w-full">
					<ImageBackground
						source={porchImage}
						imageClassName="rounded-3xl shadow-sm"
						className="max-h-64 min-h-52 w-full overflow-hidden p-4"
					>
						<View className="items-start">
							<Badge
								appearance="solid"
								color="primary"
								inverted
								className="rounded-full px-3 py-1"
							>
								<Icon as={HeartIcon} className="mr-1 size-3.5" />
								<Text className="font-semibold text-xs">Community Shared</Text>
							</Badge>
						</View>
					</ImageBackground>
				</View>

				{/* Brand Header */}
				<View className="my-6 items-center">
					<LogoContained containerClassName="mb-4" />
					<Text
						type="h1"
						className="mb-2 text-center font-extrabold text-3xl text-primary tracking-tight"
					>
						Free on the Porch
					</Text>
					<Text
						type="body-sm"
						className="px-4 text-center text-muted-foreground leading-relaxed"
					>
						Bridging digital convenience with physical community, one neighborly
						gift at a time.
					</Text>
				</View>

				{/* Actions Area */}
				<View className="my-2 w-full gap-3.5">
					<Link href="/register" asChild>
						<Button
							size="lg"
							className="w-full items-center justify-center rounded-xl py-3.5 shadow-sm"
						>
							<Button.Label className="font-bold text-base text-white">
								Get Started
							</Button.Label>
							<Icon as={ArrowRightIcon} className="ml-1 size-5" />
						</Button>
					</Link>

					<View className="flex-row items-center justify-center gap-1.5">
						<Text type="body-sm" className="text-muted-foreground">
							Already a neighbor?
						</Text>
						<Link href="/login" asChild>
							<LinkButton size="sm" className="font-bold text-primary">
								Log in
							</LinkButton>
						</Link>
					</View>

					<View className="items-center">
						<Link href="/dashboard" asChild>
							<LinkButton size="sm">Continue without an account</LinkButton>
						</Link>
					</View>
				</View>

				{/* Features Cards Row */}
				<View className="mt-8 flex-row justify-between gap-3 px-1">
					{[
						{
							label: "Pick Up",
							icon: TruckIcon,
							desc: "Curb/Porch collection",
							iconClassName: "bg-primary/10 text-primary",
						},
						{
							label: "Zero Waste",
							icon: LeafIcon,
							desc: "Earthy, eco-friendly",
							iconClassName: "bg-accent/10 text-accent",
						},
						{
							label: "Local",
							icon: UsersIcon,
							desc: "Connected neighbors",
							iconClassName: "bg-primary/10 text-primary",
						},
					].map((item) => (
						<View
							key={item.label}
							className="flex-1 items-center rounded-2xl border border-muted bg-card p-3 shadow-xs"
						>
							<View
								className={cn(
									"mb-2.5 size-11 items-center justify-center rounded-full",
									item.iconClassName,
								)}
							>
								<Icon as={item.icon} className={"size-5.5"} />
							</View>
							<Text className="mb-0.5 text-center font-bold text-foreground text-xs">
								{item.label}
							</Text>
							<Text className="text-center text-[10px] text-muted-foreground leading-tight">
								{item.desc}
							</Text>
						</View>
					))}
				</View>
			</View>
		</ScrollView>
	);
}
