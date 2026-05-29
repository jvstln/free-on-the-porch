import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const MessagesScreen = () => {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-xl font-semibold text-primary">Messages</Text>
			<Text className="text-muted-foreground mt-2">Chat with neighbors about porch items.</Text>
		</View>
	);
};

export default MessagesScreen;
