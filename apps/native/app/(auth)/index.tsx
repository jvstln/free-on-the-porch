import porchImage from "@free-on-the-porch/shared/assets/images/porch.jpg";
import { Link } from "expo-router";
import {
	ArrowRightIcon,
	HeartIcon,
	LeafIcon,
	TruckIcon,
	UsersIcon,
} from "lucide-react-native";
import { LogoContained } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImageBackground } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "@/components/ui/view";

export default function Index() {
	return (
		<ScrollView className="flex-1 bg-background p-4 pb-0">
			<ImageBackground
				source={porchImage}
				imageClassName="rounded-2xl shadow-sm"
				className="max-h-60 min-h-40 w-full flex-1 p-4"
			>
				<View className="items-start">
					<Badge appearance="solid" color="primary" inverted>
						<Icon as={HeartIcon} className="size-4" />
						<Text>Community Shared</Text>
					</Badge>
				</View>
			</ImageBackground>

			<LogoContained containerClassName="self-center mt-7 mb-3" />

			<Text type="h2" className="mb-3 text-center text-primary">
				Free on the Porch
			</Text>
			<Text type="body-sm" className="mb-4 text-center" weight="normal">
				Bridging digital convenience with physical community, one neighborly
				gift at a time.
			</Text>

			<Link href="/register" asChild>
				<Button size="lg" className="my-2 mt-auto">
					Get started
					<Icon as={ArrowRightIcon} />
				</Button>
			</Link>

			<View className="mt-2 flex-row items-center justify-center gap-1">
				<Text type="body-sm">Already have an account?</Text>
				<Link href="/login" asChild>
					<LinkButton size="sm">Log in</LinkButton>
				</Link>
			</View>

			<View className="mt-2 flex-row items-center justify-center gap-1">
				<Link href="/dashboard" asChild>
					<LinkButton size="sm">Continue without an account</LinkButton>
				</Link>
			</View>

			<View className="mt-10 mb-8 w-full flex-row justify-between px-4">
				<View className="items-center">
					<View className="mb-2 size-14 items-center justify-center rounded-full bg-secondary-foreground">
						<Icon as={TruckIcon} className="size-6 text-secondary" />
					</View>
					<Text className="font-medium text-muted-foreground text-xs">
						Pick Up
					</Text>
				</View>

				<View className="items-center">
					<View className="mb-2 size-14 items-center justify-center rounded-full bg-accent-foreground">
						<Icon as={LeafIcon} className="size-6 text-accent" />
					</View>
					<Text className="font-medium text-muted-foreground text-xs">
						Zero Waste
					</Text>
				</View>

				<View className="items-center">
					<View className="mb-2 size-14 items-center justify-center rounded-full bg-secondary">
						<Icon as={UsersIcon} className="size-6 text-secondary-foreground" />
					</View>
					<Text className="font-medium text-muted-foreground text-xs">
						Local
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}
