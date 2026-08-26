import type React from "react";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.ComponentProps<typeof View> {
	children: React.ReactNode;
}

export function PageHeaderRoot({
	children,
	className,
	...props
}: PageHeaderProps) {
	return (
		<View
			className={cn(
				"min-h-14 flex-row items-center gap-2 border-border border-b bg-card px-3 py-2",
				className,
			)}
			{...props}
		>
			{children}
		</View>
	);
}

export function PageHeaderTitle({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			type="h3"
			className={cn("mr-2 font-bold text-primary", className)}
			{...props}
		/>
	);
}

export const PageHeader = Object.assign(PageHeaderRoot, {
	Title: PageHeaderTitle,
});
