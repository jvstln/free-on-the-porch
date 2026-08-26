import { cn } from "./utils";

export const uiColors = {
	default: cn("[--bg:var(--color-background)] [--fg:var(--color-foreground)]"),
	primary: cn(
		"[--bg:var(--color-primary)] [--fg:var(--color-primary-foreground)]",
	),
	destructive: cn(
		"[--bg:var(--color-destructive)] [--fg:var(--color-destructive-foreground)]",
	),
	success: cn(
		"[--bg:var(--color-success)] [--fg:var(--color-success-foreground)]",
	),
	warning: cn(
		"[--bg:var(--color-warning)] [--fg:var(--color-warning-foreground)]",
	),
	muted: cn("[--bg:var(--color-muted)] [--fg:var(--color-muted-foreground)]"),
	neutral: cn("[--bg:var(--color-neutral-800)] [--fg:var(--color-white)]"),
} as const;

export const colorAliases: Record<
	keyof typeof uiColors,
	Array<string | RegExp>
> = {
	default: [],
	primary: ["good", "like_new", ""],
	destructive: [],
	success: [],
	warning: ["fair"],
	muted: [],
	neutral: [],
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
