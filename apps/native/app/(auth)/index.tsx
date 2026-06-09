import porchImage from "@free-on-the-porch/assets/images/porch.jpg";
import logoIconLight from "@free-on-the-porch/assets/logo-icon-light.svg";
import { Link, Redirect } from "expo-router";
import {
	ArrowRightIcon,
	HeartIcon,
	LeafIcon,
	TruckIcon,
	UsersIcon,
} from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image, ImageBackground } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

export default function Index() {
	// return <Redirect href={"/dashboard/profile"} />;
	return (
		<View className="flex-1 bg-background p-4 pb-0">
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

			<View className="mt-7 mb-3 rotate-5 self-center rounded-2xl bg-primary p-3 shadow-sm">
				<Image
					source={logoIconLight}
					className="size-12"
					contentFit="contain"
				/>
			</View>

			<Text type="h1" className="mb-3 text-center text-primary">
				Free on the Porch
			</Text>
			<Text type="h5" className="text-center" weight="normal">
				Bridging digital convenience with physical community, one neighborly
				gift at a time.
			</Text>

			<Link href="/register" asChild>
				<Button size="lg" className="my-2 mt-auto">
					<Button.Label>Get Started</Button.Label>
					<Icon as={ArrowRightIcon} />
				</Button>
			</Link>

			<View className="mt-2 flex-row items-center justify-center gap-1">
				<Text type="body">Already have an account?</Text>
				<Link href="/login" asChild>
					<LinkButton>Log In</LinkButton>
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
		</View>
	);
}
