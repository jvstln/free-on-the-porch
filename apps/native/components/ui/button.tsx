import { cva } from "class-variance-authority";
import {
	cn,
	Button as HeroUIButton,
	LinkButton as HeroUILinkButton,
} from "heroui-native";
import type React from "react";
import { TextClassContextProvider } from "./text";

type HeroUIButtonProps = React.ComponentProps<typeof HeroUIButton>;
type HeroUILinkButtonProps = React.ComponentProps<typeof HeroUILinkButton>;

type ButtonProps = HeroUIButtonProps & {
	disabled?: boolean | null;
	isLoading?: boolean;
	loadingText?: string;
	variant?: HeroUIButtonProps["variant"];
};

type LinkButtonProps = HeroUILinkButtonProps & {
	disabled?: boolean | null;
	isLoading?: boolean;
	loadingText?: string;
	variant?: "link";
};

export const buttonTextVariants = cva("", {
	variants: {
		variant: {
			primary: "text-accent-foreground",
			secondary: "text-accent-soft-foreground",
			tertiary: "text-default-foreground",
			outline: "text-default-foreground",
			ghost: "text-default-foreground",
			danger: "text-danger-foreground",
			"danger-soft": "text-danger-soft-foreground",
		},
		size: {
			sm: "text-sm",
			md: "text-base",
			lg: "text-lg",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

function ButtonRoot({
	disabled,
	isLoading,
	loadingText,
	variant,
	size,
	...props
}: ButtonProps) {
	return (
		<TextClassContextProvider value={buttonTextVariants({ variant, size })}>
			<HeroUIButton
				isDisabled={disabled === null ? false : disabled}
				variant={variant}
				size={size}
				{...props}
			/>
		</TextClassContextProvider>
	);
}

type ButtonLabelProps = React.ComponentProps<typeof HeroUIButton.Label>;

function ButtonLabel({ className, ...props }: ButtonLabelProps) {
	return <HeroUIButton.Label className={cn(className)} {...props} />;
}

export const Button = Object.assign(ButtonRoot, { Label: ButtonLabel });

/** Link button */
function LinkButtonRoot({ size, disabled, ...props }: LinkButtonProps) {
	return (
		<TextClassContextProvider
			value={cn(buttonTextVariants({ variant: "ghost", size }))}
		>
			<HeroUILinkButton
				size={size}
				isDisabled={disabled === null ? false : disabled}
				{...props}
			/>
		</TextClassContextProvider>
	);
}

export const LinkButton = Object.assign(LinkButtonRoot, {
	Label: ButtonLabel,
});
