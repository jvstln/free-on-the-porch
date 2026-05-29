import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";
import { TextClassContextProvider } from "@/components/ui/text";
import { uiColors, uiTextColors } from "@/lib/colors";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	cn(
		"group shrink-0 flex-row items-center justify-center gap-1 gap-2 overflow-hidden rounded-full",
		Platform.select({
			web: "w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
		}),
	),
	{
		variants: {
			color: uiColors,
			inverted: {
				true: "[--bg:var(--fg-v)] [--fg:var(--bg-v)]",
				false: "[--bg:var(--bg-v)] [--fg:var(--fg-v)]",
			},
			appearance: {
				solid: cn(
					"bg-(--bg) text-(--fg)",
					Platform.select({ web: "hover:bg-(--bg)/90" }),
				),
				outline: cn(
					"border border-(--bg) bg-transparent text-(--bg)",
					Platform.select({ web: "hover:bg-(--bg)/10" }),
				),
				ghost: cn(
					"bg-transparent text-(--bg)",
					Platform.select({ web: "hover:bg-(--bg)/10" }),
				),
				soft: "bg-(--bg)/15 text-(--bg)",
			},
			size: {
				default: "px-3 py-1.5",
				sm: "px-2 py-0.5",
				lg: "px-4 py-2",
			},
		},
		defaultVariants: {
			color: "primary",
			inverted: false,
			appearance: "solid",
			size: "default",
		},
	},
);

const badgeTextVariants = cva("font-medium", {
	variants: {
		color: uiTextColors,
		inverted: {
			true: "[--t-bg:var(--t-fg-v)] [--t-fg:var(--t-bg-v)]",
			false: "[--t-bg:var(--t-bg-v)] [--t-fg:var(--t-fg-v)]",
		},
		appearance: {
			solid: "text-(--t-fg)",
			outline: "text-(--t-bg)",
			ghost: "text-(--t-bg)",
			soft: "text-(--t-bg)",
		},
		size: {
			default: "text-xs",
			sm: "text-[10px]",
			lg: "text-sm",
		},
	},
	defaultVariants: {
		color: "primary",
		inverted: false,
		appearance: "solid",
		size: "default",
	},
});

type BadgeProps = React.ComponentProps<typeof View> &
	React.RefAttributes<View> & {
		asChild?: boolean;
	} & VariantProps<typeof badgeVariants>;

function Badge({
	className,
	color,
	appearance,
	size,
	inverted,
	asChild,
	...props
}: BadgeProps) {
	const Component = asChild ? Slot : View;
	return (
		<TextClassContextProvider
			value={badgeTextVariants({ color, appearance, size, inverted })}
		>
			<Component
				className={cn(
					badgeVariants({ color, appearance, size, inverted }),
					className,
				)}
				{...props}
			/>
		</TextClassContextProvider>
	);
}

export type { BadgeProps };
export { Badge, badgeTextVariants, badgeVariants };
