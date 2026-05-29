import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const PostScreen = () => {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-xl font-semibold text-primary">Post a New Item</Text>
			<Text className="text-muted-foreground mt-2">Share something free with your neighbors.</Text>
		</View>
	);
};

export default PostScreen;
