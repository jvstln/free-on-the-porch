import { LogoContained } from "@/components/logo";
import { Text } from "@/components/ui/text";
import { KeyboardAvoidingView, ScrollView, View } from "@/components/ui/view";

export const OnboardingLayout = ({
	children,
	description,
}: {
	children?: React.ReactNode;
	description?: React.ReactNode;
	className?: string;
}) => {
	return (
		<KeyboardAvoidingView className="flex-1">
			<ScrollView contentContainerClassName="justify-center grow px-4 py-8">
				{/* Top Header */}
				<View className="mb-8 items-center text-center">
					<LogoContained className="size-12" containerClassName="mb-4" />
					<Text type="h1" className="mb-2 text-primary">
						Free on the Porch
					</Text>
					<Text type="body-sm">{description}</Text>
				</View>
				{children}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
