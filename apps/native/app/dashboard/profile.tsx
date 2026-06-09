import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

const ProfileScreen = () => {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="font-semibold text-primary text-xl">Your Profile</Text>
			<Text className="mt-2 text-muted-foreground">
				Manage your posts and neighborhood settings.
			</Text>
		</View>
	);
};

export default ProfileScreen;
