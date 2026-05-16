import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { uiColors, uiTextColors } from "@/lib/colors";

const badgeVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full px-2 py-0.5",
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
    },
    defaultVariants: {
      color: "primary",
      inverted: false,
      appearance: "solid",
    },
  },
);

const badgeTextVariants = cva("font-medium text-xs", {
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
  },
  defaultVariants: {
    color: "primary",
    inverted: false,
    appearance: "solid",
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
  inverted,
  asChild,
  ...props
}: BadgeProps) {
  const Component = asChild ? Slot : View;
  return (
    <TextClassContext.Provider
      value={badgeTextVariants({ color, appearance, inverted })}
    >
      <Component
        className={cn(
          badgeVariants({ color, appearance, inverted }),
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export type { BadgeProps };
export { Badge, badgeTextVariants, badgeVariants };
