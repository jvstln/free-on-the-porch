import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";
import { TextClassContextProvider } from "@/components/ui/text";
import { uiColors } from "@/lib/colors.util";
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
				true: "[--bg-v:var(--fg)] [--fg-v:var(--bg)]",
				false: "[--bg-v:var(--bg)] [--fg-v:var(--fg)]",
			},
			appearance: {
				solid: cn(
					"bg-(--bg-v) text-(--fg-v)",
					Platform.select({ web: "hover:bg-(--bg-v)/90" }),
				),
				outline: cn(
					"border border-(--bg-v) bg-transparent text-(--bg-v)",
					Platform.select({ web: "hover:bg-(--bg-v)/10" }),
				),
				ghost: cn(
					"bg-transparent text-(--bg-v)",
					Platform.select({ web: "hover:bg-(--bg-v)/10" }),
				),
				soft: "bg-(--bg-v)/15 text-(--bg-v)",
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
			value={badgeVariants({ color, appearance, size, inverted })}
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
export { Badge, badgeVariants };
