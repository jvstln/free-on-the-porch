import type { ReportReasonDto } from "@free-on-the-porch/shared/schemas";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import { useCreateReport } from "@/features/moderation/use-moderation";
import { cn } from "@/lib/utils";

const REASONS: { value: ReportReasonDto; label: string }[] = [
	{ value: "SPAM", label: "Spam / Fake Account" },
	{ value: "INAPPROPRIATE", label: "Inappropriate Content" },
	{ value: "ALREADY_TAKEN", label: "Already Taken" },
	{ value: "FAKE", label: "Fake / Misleading" },
	{ value: "OTHER", label: "Other" },
];

export default function ReportModal() {
	const params = useLocalSearchParams<{
		reportedUserId?: string;
		listingId?: string;
	}>();
	const insets = useSafeAreaInsets();
	const reportMutation = useCreateReport();

	const [selectedReason, setSelectedReason] = useState<ReportReasonDto | null>(
		null,
	);
	const [details, setDetails] = useState("");

	const canSubmit = !!selectedReason;

	const handleSubmit = async () => {
		if (!selectedReason) return;

		try {
			await reportMutation.mutateAsync({
				reason: selectedReason,
				details: details || undefined,
				reportedUserId: params.reportedUserId,
				listingId: params.listingId,
			});
			toast.success("Report submitted. Our team will review it.");
			router.back();
		} catch {
			toast.error("Failed to submit report. Please try again.");
		}
	};

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: Math.max(insets.top, 16) }}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between border-border border-b px-4 py-3">
				<Button
					appearance="ghost"
					color="neutral"
					onPress={() => router.back()}
				>
					<Button.Label>Cancel</Button.Label>
				</Button>
				<Text type="h4" className="font-bold text-foreground">
					Report
				</Text>
				<Button
					appearance="ghost"
					onPress={handleSubmit}
					disabled={!canSubmit || reportMutation.isPending}
					isLoading={reportMutation.isPending}
				>
					<Button.Label>Submit</Button.Label>
				</Button>
			</View>

			{/* Reason selector */}
			<View className="gap-2 px-4 pt-6">
				<Text type="body-sm" className="mb-2 font-bold text-foreground">
					Reason for reporting
				</Text>
				{REASONS.map((reason) => (
					<Pressable
						key={reason.value}
						onPress={() => setSelectedReason(reason.value)}
						className={cn(
							"rounded-xl border px-4 py-3 transition-colors",
							selectedReason === reason.value
								? "border-primary bg-primary/10"
								: "border-border bg-card",
						)}
					>
						<Text
							type="body-sm"
							className={
								selectedReason === reason.value
									? "font-semibold text-primary"
									: "text-foreground"
							}
						>
							{reason.label}
						</Text>
					</Pressable>
				))}
			</View>

			{/* Details textarea */}
			<View className="px-4 pt-6">
				<Text type="body-sm" className="mb-2 font-bold text-foreground">
					Additional details (optional)
				</Text>
				<View className="rounded-xl border border-border bg-card p-3">
					<TextInput
						className="text-foreground text-sm"
						onChangeText={setDetails}
						multiline
						numberOfLines={4}
						placeholder="Provide any additional context..."
						placeholderTextColor="#A89880"
						value={details}
						style={{ minHeight: 80, textAlignVertical: "top" }}
					/>
				</View>
			</View>
		</View>
	);
}
