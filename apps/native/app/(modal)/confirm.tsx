import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

export default function ConfirmModal() {
	const params = useLocalSearchParams<{
		title?: string;
		description?: string;
		confirmLabel?: string;
	}>();
	const insets = useSafeAreaInsets();

	const title = params.title ?? "Are you sure?";
	const description = params.description ?? "This action cannot be undone.";
	const confirmLabel = params.confirmLabel ?? "Confirm";

	const handleConfirm = () => {
		router.back();
	};

	return (
		<View
			className="flex-1 justify-end bg-background"
			style={{ paddingBottom: Math.max(insets.bottom, 16) }}
		>
			<View className="rounded-t-3xl bg-card px-6 pt-8 pb-6">
				<Text type="h4" className="mb-2 font-bold text-foreground">
					{title}
				</Text>
				<Text type="body-sm" className="mb-8 text-muted-foreground">
					{description}
				</Text>
				<View className="gap-3">
					<Button
						size="lg"
						className="rounded-xl bg-destructive py-4"
						onPress={handleConfirm}
					>
						<Button.Label className="font-bold text-destructive-foreground">
							{confirmLabel}
						</Button.Label>
					</Button>
					<Button
						size="lg"
						appearance="ghost"
						color="neutral"
						className="rounded-xl py-4"
						onPress={() => router.back()}
					>
						<Button.Label>Cancel</Button.Label>
					</Button>
				</View>
			</View>
		</View>
	);
}
