import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Platform, Pressable, View } from "react-native";
import { Text, TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { uiColors, uiTextColors } from "@/lib/colors";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-2 rounded-full transition-all active:scale-99",
    Platform.select({
      web: "whitespace-nowrap outline-none hover:-translate-y-0.5 hover:scale-103 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    }),
  ),
  {
    variants: {
      color: uiColors,
      inverted: {
        true: "[--bg:var(--fg-v)] [--fg:var(--bg-v)]",
        false: "[--bg:var(--bg-v)] [--fg:var(--bg-v)]",
      },
      appearance: {
        solid: cn(
          "bg-(--bg) text-(--fg) hover:bg-(--bg)/90",
          Platform.select({ web: "hover:bg-(--bg)/90" }),
        ),
        outline: cn(
          "border border-(--bg) bg-transparent text-(--bg) active:bg-(--bg)/10",
          Platform.select({ web: "hover:bg-(--bg)/10" }),
        ),
        ghost: cn(
          "bg-transparent text-(--bg) active:bg-(--bg)/10",
          Platform.select({ web: "hover:bg-(--bg)/10" }),
        ),
        link: "bg-transparent text-(--bg) underline-offset-4 active:underline",
        soft: "bg-(--bg)/15 text-(--bg) active:bg-(--bg)/25",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 gap-1 px-2.5",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-10 px-6",
        xl: "h-12 px-8 text-base",
        "2xl": "h-14 px-8 text-lg",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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

const buttonTextVariants = cva(
  cn(
    "font-semibold text-sm",
    Platform.select({ web: "pointer-events-none transition-colors" }),
  ),
  {
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
        link: "text-(--t-bg) underline-offset-4 active:underline",
        soft: "text-(--t-bg)",
      },
      size: {
        default: "text-sm",
        xs: "text-xs",
        sm: "text-sm",
        lg: "text-sm",
        xl: "text-base",
        "2xl": "text-lg",
        icon: "",
        "icon-sm": "",
        "icon-lg": "",
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

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    loadingText?: string;
  };

function Button({
  className,
  color,
  appearance,
  size,
  inverted,
  isLoading,
  loadingText,
  children,
  ...props
}: ButtonProps) {
  const textClass = buttonTextVariants({ color, appearance, size, inverted });

  return (
    <TextClassContext.Provider value={textClass}>
      <Pressable
        className={cn(
          (props.disabled || isLoading) && "opacity-50",
          buttonVariants({ color, appearance, size, inverted }),
          className,
        )}
        role="button"
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <View className="flex-row items-center gap-2">
            <Spinner color={Platform.OS === "ios" ? undefined : "white"} />
            {loadingText ? <Text>{loadingText}</Text> : null}
          </View>
        ) : (
          children
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export type { ButtonProps };
export { Button, buttonTextVariants, buttonVariants };
