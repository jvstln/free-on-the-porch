import { Slot } from "expo-router";
import { SafeAreaView } from "@/components/ui/view";

const AuthLayout = () => {
	return (
		<SafeAreaView className="flex-1">
			<Slot />
		</SafeAreaView>
	);
};

export default AuthLayout;
