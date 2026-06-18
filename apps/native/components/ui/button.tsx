import { cva, type VariantProps } from "class-variance-authority";
import {
	cn,
	Button as HeroUIButton,
	LinkButton as HeroUILinkButton,
} from "heroui-native";
import type React from "react";
import { Platform } from "react-native";
import { uiColors } from "@/lib/colors.util";
import { Spinner } from "./spinner";
import {
	TextClassContextProvider,
	useInheritableTextClassContext,
} from "./text";

type HeroUIButtonProps = React.ComponentProps<typeof HeroUIButton>;
type HeroUILinkButtonProps = React.ComponentProps<typeof HeroUILinkButton>;

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = HeroUIButtonProps &
	ButtonVariants & {
		disabled?: boolean | null;
		isLoading?: boolean;
		loadingText?: string;
	};

type LinkButtonProps = HeroUILinkButtonProps &
	Omit<ButtonVariants, "appearance"> & {
		disabled?: boolean | null;
		isLoading?: boolean;
		loadingText?: string;
	};

const buttonVariants = cva(
	cn(
		"group shrink-0 flex-row items-center justify-center gap-2 rounded-md transition-all active:scale-99",
		Platform.select({
			web: "whitespace-nowrap outline-none hover:-translate-y-0.5 hover:scale-103 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		}),
	),
	{
		variants: {
			color: uiColors,
			inverted: {
				true: "[--bg-v:var(--fg)] [--fg-v:var(--bg)]",
				false: "[--bg-v:var(--bg)] [--fg-v:var(--fg)]",
			},
			appearance: {
				solid: cn(
					"bg-(--bg-v) text-(--fg-v) hover:bg-(--bg-v)/90",
					Platform.select({ web: "hover:bg-(--bg-v)/90" }),
				),
				outline: cn(
					"border border-(--bg-v) bg-transparent text-(--bg-v) active:bg-(--bg-v)/10",
					Platform.select({ web: "hover:bg-(--bg-v)/10" }),
				),
				ghost: cn(
					"bg-transparent text-(--bg-v) active:bg-(--bg-v)/10",
					Platform.select({ web: "hover:bg-(--bg-v)/10" }),
				),
				link: "bg-transparent text-(--bg-v) underline-offset-4 active:underline",
				soft: "border border-(--bg-v) bg-(--bg-v)/15 text-(--bg-v) active:bg-(--bg-v)/25",
			},
			// size: {
			// 	default: "h-9 px-4 py-2",
			// 	xs: "h-7 gap-1 px-2.5",
			// 	sm: "h-8 gap-1.5 px-3",
			// 	lg: "h-10 px-6",
			// 	xl: "h-12 px-8 text-base",
			// 	"2xl": "h-14 px-8 text-lg",
			// 	icon: "size-9",
			// 	"icon-sm": "size-8",
			// 	"icon-lg": "size-10",
			// },
		},
		defaultVariants: {
			color: "primary",
			inverted: false,
			appearance: "solid",
		},
	},
);

function ButtonRoot({
	isLoading,
	loadingText,
	variant,
	color,
	appearance,
	size,
	children,
	...props
}: ButtonProps) {
	const resolvedChildren = Array.isArray(children) ? (
		children.map((child) => {
			return typeof child !== "object" && child !== null ? (
				<ButtonLabel key={child}>{child}</ButtonLabel>
			) : (
				child
			);
		})
	) : typeof children !== "object" ? (
		<ButtonLabel>{children}</ButtonLabel>
	) : (
		children
	);

	const disabled = props.disabled || isLoading || false;

	return (
		<TextClassContextProvider value={buttonVariants({ color, appearance })}>
			<HeroUIButton
				variant={variant}
				size={size}
				{...props}
				className={cn(buttonVariants({ color, appearance }), props.className)}
				isDisabled={disabled}
			>
				{isLoading ? (
					<>
						<Spinner />
						{loadingText && <ButtonLabel>{loadingText}</ButtonLabel>}
					</>
				) : (
					resolvedChildren
				)}
				{/* {resolvedChildren} */}
			</HeroUIButton>
		</TextClassContextProvider>
	);
}

type ButtonLabelProps = React.ComponentProps<typeof HeroUIButton.Label>;

function ButtonLabel({ className, ...props }: ButtonLabelProps) {
	const textClassName = useInheritableTextClassContext();

	return (
		<HeroUIButton.Label className={cn(textClassName, className)} {...props} />
	);
}

export const Button = Object.assign(ButtonRoot, { Label: ButtonLabel });

/** Link button */
function LinkButtonRoot({
	size,
	color,
	className,
	disabled,
	...props
}: LinkButtonProps) {
	return (
		<TextClassContextProvider
			value={cn(buttonVariants({ appearance: "link" }))}
		>
			<HeroUILinkButton
				size={size}
				isDisabled={disabled === null ? false : disabled}
				className={cn(buttonVariants({ color, appearance: "link" }), className)}
				{...props}
			/>
		</TextClassContextProvider>
	);
}

export const LinkButton = Object.assign(LinkButtonRoot, {
	Label: ButtonLabel,
});
