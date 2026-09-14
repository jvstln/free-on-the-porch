import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { ControlField } from "heroui-native";
import * as React from "react";
import type { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	ImagePicker,
	type ImagePickerAsset,
	type ImagePickerProps,
} from "@/components/ui/image-picker";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
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

export function InputField({ label, description, ...props }: InputFieldProps) {
	const field = useFieldContext<string | null | undefined>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field invalid={hasError}>
			{label && <FieldLabel>{label}</FieldLabel>}
			<Input
				value={field.state.value ?? ""}
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
	numberOfLines,
}: TextareaFieldProps) {
	const field = useFieldContext<string | null | undefined>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field invalid={hasError}>
			{label && <FieldLabel>{label}</FieldLabel>}
			<Textarea
				value={field.state.value ?? ""}
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
}: Omit<FieldProps, "placeholder">) {
	const field = useFieldContext<boolean>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<ControlField
			isSelected={field.state.value}
			onSelectedChange={field.handleChange}
			isInvalid={hasError}
			className="flex-col items-start gap-1"
		>
			<View className="flex-row items-center gap-3">
				<ControlField.Indicator>
					<Checkbox />
				</ControlField.Indicator>
				<FieldLabel className="flex-1">
					{React.isValidElement(label) ? (
						label
					) : (
						<Text className="text-foreground text-sm leading-5">{label}</Text>
					)}
				</FieldLabel>
			</View>
			{description && (
				<FieldDescription className="ml-7">{description}</FieldDescription>
			)}
			<FieldError errors={field.state.meta.errors} className="ml-7" />
		</ControlField>
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
}: Omit<FieldProps, "placeholder">) {
	const field = useFieldContext<boolean>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field invalid={hasError}>
			<View className="flex-row items-center justify-between gap-3">
				<View className="flex-1 gap-1">
					{label && <FieldLabel>{label}</FieldLabel>}
					{description && <FieldDescription>{description}</FieldDescription>}
				</View>
				<Switch value={field.state.value} onValueChange={field.handleChange} />
			</View>
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}

/**
 * Single-select option group field (pills or segmented) with label, description, and error message.
 *
 * @example
 * ```tsx
 * <form.AppField name="category">
 *   {(field) => (
 *     <field.ToggleGroupField
 *       label="Category"
 *       options={[
 *         { value: "FURNITURE", label: "Furniture" },
 *         { value: "ELECTRONICS", label: "Electronics" },
 *       ]}
 *     />
 *   )}
 * </form.AppField>
 * ```
 */
export type ToggleGroupFieldOption<
	T extends string | number = string | number,
> = {
	value: T;
	label: string;
	color?: React.ComponentProps<typeof Button>["color"];
};

export type ToggleGroupFieldProps<T extends string | number = string | number> =
	FieldProps & {
		options: ToggleGroupFieldOption<T>[];
		type?: "pill" | "segmented";
		size?: React.ComponentProps<typeof Button>["size"];
		scrollable?: boolean;
		className?: string;
		contentContainerClassName?: string;
	};

export function ToggleGroupField<T extends string | number = string | number>({
	label,
	description,
	options,
	type = "pill",
	size = "xs",
	scrollable = false,
	className,
	contentContainerClassName,
}: ToggleGroupFieldProps<T>) {
	const field = useFieldContext<T | undefined>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field invalid={hasError}>
			{label && <FieldLabel>{label}</FieldLabel>}
			<ToggleGroup
				value={field.state.value}
				onValueChange={(val) => field.handleChange(val as T)}
				type={type}
				size={size}
				scrollable={scrollable}
				className={className}
				contentContainerClassName={contentContainerClassName}
			>
				{options.map((opt) => (
					<ToggleGroup.Item key={opt.value} value={opt.value} color={opt.color}>
						{opt.label}
					</ToggleGroup.Item>
				))}
			</ToggleGroup>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldError errors={field.state.meta.errors} />
		</Field>
	);
}

// ─── Image Picker Field ──────────────────────────────────────────────────────

/**
 * Image picker field for single or multi-photo upload with camera, library, and preview support.
 *
 * @example
 * ```tsx
 * <form.AppField name="photos">
 *   {(field) => (
 *     <field.ImagePickerField
 *       label="Add Photos"
 *       max={5}
 *       multiple
 *     />
 *   )}
 * </form.AppField>
 * ```
 */
export type ImagePickerFieldProps = FieldProps &
	Omit<ImagePickerProps, "value" | "onChange">;

export function ImagePickerField({
	label,
	description,
	...props
}: ImagePickerFieldProps) {
	const field = useFieldContext<ImagePickerAsset[] | string[]>();
	const hasError = field.state.meta.errors.length > 0;

	return (
		<Field invalid={hasError}>
			{label && <FieldLabel>{label}</FieldLabel>}
			<ImagePicker
				value={field.state.value}
				onChange={field.handleChange}
				{...props}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
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
		ToggleGroupField,
		ImagePickerField,
	},
	formComponents: {},
});
