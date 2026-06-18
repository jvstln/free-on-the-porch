import { Skeleton as HeroUISkeleton } from "heroui-native";
import type React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.ComponentProps<typeof HeroUISkeleton> & {
	className?: string;
};

export function Skeleton({
	className,
	variant = "shimmer",
	...props
}: SkeletonProps) {
	return (
		<HeroUISkeleton
			variant={variant}
			className={cn("rounded-md bg-muted", className)}
			{...props}
		/>
	);
}
