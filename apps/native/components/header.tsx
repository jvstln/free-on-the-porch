import { Search } from "lucide-react-native";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

export function Header() {
	return (
		<View className="flex-row items-center justify-between px-5 py-4">
			<View className="flex-row items-center gap-2">
				<View className="rounded-md bg-primary p-2">
					<Logo className="size-8 text-primary-foreground" />
				</View>
				<Text type="h3" className="font-bold text-primary">
					Free on the Porch
				</Text>
			</View>
			<Button variant="ghost">
				<Icon as={Search} />
			</Button>
		</View>
	);
}
