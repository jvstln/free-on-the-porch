import {
	Description as HeroUIDescription,
	FieldError as HeroUIFieldError,
	Label as HeroUILabel,
	TextField as HeroUITextField,
} from "heroui-native";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Field Primitives ───────────────────────────────────────────────────────
/**
 * Container for a form field. Wraps label, control, description, and error.
 */
export function Field({
	className,
	children,
	required,
	invalid,
	disabled,
}: {
	className?: string;
	children: ReactNode;
	required?: boolean;
	invalid?: boolean;
	disabled?: boolean;
}) {
	return (
		<HeroUITextField
			isRequired={required}
			isInvalid={invalid}
			isDisabled={disabled}
			className={cn("gap-2", className)}
		>
			{children}
		</HeroUITextField>
	);
}

type LabelProps = Omit<
	React.ComponentProps<typeof HeroUILabel>,
	"isDisabled" | "isInvalid" | "isRequired"
> & { disabled?: boolean; invalid?: boolean; required?: boolean };

export function FieldLabel({
	disabled,
	invalid,
	required,
	className,
	...props
}: LabelProps) {
	return (
		<HeroUILabel
			isDisabled={disabled}
			isInvalid={invalid}
			isRequired={required}
			className={cn(className)}
			{...props}
		/>
	);
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
		<HeroUIDescription className={cn(className)}>{children}</HeroUIDescription>
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
		<HeroUIFieldError isInvalid className={cn("", className)}>
			{messages[0]}
		</HeroUIFieldError>
	);
}
