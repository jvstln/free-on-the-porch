import { Checkbox as HeroCheckbox } from "heroui-native";
import type * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
	extends Omit<
		React.ComponentPropsWithRef<typeof HeroCheckbox>,
		"isSelected" | "onSelectedChange"
	> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	isSelected?: boolean;
	onSelectedChange?: (isSelected: boolean) => void;
}

function Checkbox({
	checked,
	onCheckedChange,
	isSelected,
	onSelectedChange,
	isInvalid,
	isDisabled,
	className,
	ref,
	...props
}: CheckboxProps) {
	const resolvedSelected = isSelected ?? checked;
	const resolvedSelectedChange = onSelectedChange ?? onCheckedChange;

	return (
		<HeroCheckbox
			ref={ref}
			isSelected={resolvedSelected}
			onSelectedChange={resolvedSelectedChange}
			isInvalid={isInvalid}
			isDisabled={isDisabled}
			className={cn(className)}
			{...props}
		/>
	);
}

export { Checkbox };
