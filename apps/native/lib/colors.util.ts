import { cn } from "./utils";

export const uiColors = {
	primary: cn(
		"[--bg:var(--color-primary)] [--fg:var(--color-primary-foreground)]",
	),
	secondary: cn(
		"[--bg:var(--color-secondary)] [--fg:var(--color-secondary-foreground)]",
	),
	destructive: cn(
		"[--bg:var(--color-destructive)] [--fg:var(--color-destructive-foreground)]",
	),
	neutral: cn("[--bg:var(--color-foreground)] [--fg:var(--color-background)]"),
	accent: cn(
		"[--bg:var(--color-accent)] [--fg:var(--color-accent-foreground)]",
	),
	success: cn(
		"[--bg:var(--color-success)] [--fg:var(--color-success-foreground)]",
	),
	warning: cn(
		"[--bg:var(--color-warning)] [--fg:var(--color-warning-foreground)]",
	),
	default: cn(
		"[--bg:var(--color-default)] [--fg:var(--color-default-foreground)]",
	),
} as const;

export const colorAliases: Record<
	keyof typeof uiColors,
	Array<string | RegExp>
> = {
	primary: ["good", "like_new", ""],
	warning: ["fair"],
	accent: [],
	default: [],
	destructive: [],
	neutral: [],
	secondary: [],
	success: [],
} as const;

const colorAliasesEntries = Object.entries(colorAliases) as readonly [
	keyof typeof uiColors,
	readonly (string | RegExp)[],
][];

export const resolveColorAlias = (alias: string): keyof typeof uiColors => {
	return (
		colorAliasesEntries.find(([_, aliases]) =>
			aliases.some((value) =>
				value instanceof RegExp ? value.test(alias) : value === alias,
			),
		)?.[0] ?? "default"
	);
};
