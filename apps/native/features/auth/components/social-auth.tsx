import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { GoogleAuthButton } from "./google-auth";

export interface SocialAuthProps {
	label?: string;
	className?: string;
}

export const SocialAuth = ({
	label = "Or continue with",
	className,
}: SocialAuthProps) => {
	return (
		<View className={className}>
			<View className="my-4 flex-row items-center gap-3 px-1">
				<Separator className="grow border-border/30 border-t bg-surface" />
				<Text
					type="body-xs"
					className="font-medium text-muted-foreground uppercase tracking-wider"
				>
					{label}
				</Text>
				<Separator className="grow border-border/30 border-t bg-surface" />
			</View>

			<View className="flex-row gap-3">
				<GoogleAuthButton />
			</View>
		</View>
	);
};
