import type React from "react";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

export interface EmptyStateProps {
	icon: React.ComponentProps<typeof Icon>["as"];
	title: string;
	description?: string;
	children?: React.ReactNode;
}

export function EmptyState({
	icon,
	title,
	description,
	children,
}: EmptyStateProps) {
	return (
		<View className="flex-1 items-center justify-center px-6 py-20">
			<View className="mb-4 size-16 items-center justify-center rounded-full bg-surface">
				<Icon as={icon} className="size-8 text-muted-foreground" />
			</View>
			<Text type="h4" className="mb-2 text-center font-bold text-foreground">
				{title}
			</Text>
			{description && (
				<Text type="body-sm" className="text-center text-muted-foreground">
					{description}
				</Text>
			)}
			{children}
		</View>
	);
}
