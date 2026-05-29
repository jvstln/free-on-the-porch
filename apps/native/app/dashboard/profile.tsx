import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const ProfileScreen = () => {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-xl font-semibold text-primary">Your Profile</Text>
			<Text className="text-muted-foreground mt-2">Manage your posts and neighborhood settings.</Text>
		</View>
	);
};

export default ProfileScreen;
