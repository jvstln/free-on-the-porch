import { cn } from "./utils";

export const uiColors = {
  primary: cn(
    "[--bg-v:var(--color-primary)] [--fg-v:var(--color-primary-foreground)]",
  ),
  secondary: cn(
    "[--bg-v:var(--color-secondary)] [--fg-v:var(--color-secondary-foreground)]",
  ),
  destructive: cn(
    "[--bg-v:var(--color-destructive)] [--fg-v:var(--color-destructive-foreground)]",
  ),
  neutral: cn(
    "[--bg-v:var(--color-foreground)] [--fg-v:var(--color-background)]",
  ),
  accent: cn(
    "[--bg-v:var(--color-accent)] [--fg-v:var(--color-accent-foreground)]",
  ),
} as const;

export const uiTextColors = {
  primary: cn(
    "[--t-bg-v:var(--color-primary)] [--t-fg-v:var(--color-primary-foreground)]",
  ),
  secondary: cn(
    "[--t-bg-v:var(--color-secondary)] [--t-fg-v:var(--color-secondary-foreground)]",
  ),
  destructive: cn(
    "[--t-bg-v:var(--color-destructive)] [--t-fg-v:var(--color-destructive-foreground)]",
  ),
  neutral: cn(
    "[--t-bg-v:var(--color-foreground)] [--t-fg-v:var(--color-background)]",
  ),
  accent: cn(
    "[--t-bg-v:var(--color-accent)] [--t-fg-v:var(--color-accent-foreground)]",
  ),
} as const;
