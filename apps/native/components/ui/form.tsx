import {
	createFormHook,
	createFormHookContexts,
} from "@tanstack/react-form";
import * as React from "react";
import { Switch } from "react-native";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError } from "./field";
import { Text } from "./text";
import { View } from "./view";

// ─── TanStack Form Hook Contexts ────────────────────────────────────────────

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

// ─── Shared Types ───────────────────────────────────────────────────────────

export type FieldProps = {
	label?: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	className?: string;
};

// ─── Field Components (for use with TanStack Form) ──────────────────────────

/**
 * Text input field with label, description, and error message.
 *
 * @example
 * ```tsx
 * <form.AppField name="email">
 *   {(field) => <field.InputField label="Email" placeholder="you@example.com" />}
 * </form.AppField>
 * ```
 */
export type InputFieldProps = FieldProps &
	React.ComponentProps<typeof Input> & {};

export function InputField({
	label,
	description,
	className,
	...props
}: InputFieldProps) {
	const field = useFieldContext<string>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field className={className}>
			{label && <Label>{label}</Label>}
			<Input
				value={field.state.value}
				onChangeText={field.handleChange}
				onBlur={field.handleBlur}
				className={cn(hasError && "border-destructive")}
				{...props}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}

/**
 * Multiline text input field with label, description, and error message.
 *
 * @example
 * ```tsx
 * <form.AppField name="bio">
 *   {(field) => <field.TextareaField label="Bio" placeholder="Tell us about yourself..." />}
 * </form.AppField>
 * ```
 */
export type TextareaFieldProps = FieldProps & {
	numberOfLines?: number;
};

export function TextareaField({
	label,
	description,
	placeholder,
	className,
	numberOfLines,
}: TextareaFieldProps) {
	const field = useFieldContext<string>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field className={className}>
			{label && <Label>{label}</Label>}
			<Textarea
				value={field.state.value}
				onChangeText={field.handleChange}
				onBlur={field.handleBlur}
				placeholder={placeholder}
				numberOfLines={numberOfLines}
				className={cn(hasError && "border-destructive")}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}

/**
 * Checkbox field with label, description, and error message.
 * Renders label inline to the right of the checkbox.
 *
 * @example
 * ```tsx
 * <form.AppField name="agreeToTerms">
 *   {(field) => (
 *     <field.CheckboxField
 *       label="I agree to the Terms of Service"
 *       description="You must accept to continue."
 *     />
 *   )}
 * </form.AppField>
 * ```
 */
export function CheckboxField({
	label,
	description,
	className,
}: Omit<FieldProps, "placeholder">) {
	const field = useFieldContext<boolean>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field className={className}>
			<View className="flex-row items-start gap-3">
				<Checkbox
					checked={field.state.value}
					onCheckedChange={field.handleChange}
					className={cn(hasError && "border-destructive")}
				/>
				{React.isValidElement(label) ? (
					label
				) : (
					<Text className="flex-1 text-foreground text-sm leading-5">
						{label}
					</Text>
				)}
			</View>
			{description && (
				<FieldDescription className="ml-7">{description}</FieldDescription>
			)}
			<FieldError errors={field.state.meta.errors} className="ml-7" />
		</Field>
	);
}

/**
 * Switch/toggle field with label, description, and error message.
 * Renders label to the left and the switch to the right.
 *
 * @example
 * ```tsx
 * <form.AppField name="notifications">
 *   {(field) => (
 *     <field.SwitchField
 *       label="Enable notifications"
 *       description="We'll send you updates about your listings."
 *     />
 *   )}
 * </form.AppField>
 * ```
 */
export function SwitchField({
	label,
	description,
	className,
}: Omit<FieldProps, "placeholder">) {
	const field = useFieldContext<boolean>();

	return (
		<Field className={className}>
			<View className="flex-row items-center justify-between gap-3">
				<View className="flex-1 gap-1">
					{label && <Label>{label}</Label>}
					{description && <FieldDescription>{description}</FieldDescription>}
				</View>
				<Switch
					value={field.state.value}
					onValueChange={field.handleChange}
					trackColor={{ false: "#c1c9bf", true: "#316342" }}
					thumbColor="#ffffff"
				/>
			</View>
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}


// ─── Form Hook ──────────────────────────────────────────────────────────────

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		InputField,
		TextareaField,
		CheckboxField,
		SwitchField,
	},
	formComponents: {},
});
