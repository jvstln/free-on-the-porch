import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const MessagesScreen = () => {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="font-semibold text-primary text-xl">Messages</Text>
			<Text className="mt-2 text-muted-foreground">
				Chat with neighbors about porch items.
			</Text>
		</View>
	);
};

export default MessagesScreen;
