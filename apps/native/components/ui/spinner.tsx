import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { cn } from "@/lib/utils";

function Spinner({
	className,
	...props
}: ActivityIndicatorProps & { className?: string }) {
	return (
		<ActivityIndicator
			className={cn("size-4", className)}
			// Inherit color from text context if possible, or use a default
			{...props}
		/>
	);
}

export { Spinner };
