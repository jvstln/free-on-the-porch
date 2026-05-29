import { CircleAlert } from "lucide-react-native";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";
import { View } from "./view";

// ─── Field Primitives ───────────────────────────────────────────────────────
/**
 * Container for a form field. Wraps label, control, description, and error.
 */
export function Field({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <View className={cn("gap-2", className)}>{children}</View>;
}

/**
 * Description text shown below the control.
 */
export function FieldDescription({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<Text className={cn("text-muted-foreground text-xs leading-5", className)}>
			{children}
		</Text>
	);
}

/**
 * Error message shown below the control when validation fails.
 * Renders nothing if no errors are present.
 */
export function FieldError({
	errors,
	className,
}: {
	errors?: Array<{ message?: string } | string | undefined>;
	className?: string;
}) {
	if (!errors?.length) return null;

	// Deduplicate errors and extract messages
	const messages = [
		...new Set(
			errors
				.map((e) => (typeof e === "string" ? e : e?.message))
				.filter(Boolean),
		),
	];

	if (messages.length === 0) return null;

	return (
		<View className={cn("flex-row items-start gap-1.5", className)}>
			<Icon as={CircleAlert} className="mt-0.5 size-3.5 text-destructive" />
			<Text className="flex-1 text-destructive text-xs leading-5">
				{messages.join(". ")}
			</Text>
		</View>
	);
}
