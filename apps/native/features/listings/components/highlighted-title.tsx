import { Text } from "@/components/ui/text";

// Splits text into segments marking which parts match any of the
// space-delimited search terms (case-insensitive). Matching parts get
// `match: true`; everything else `false`.
export function splitBySearchTerm(
	text: string,
	searchTerm?: string,
): { text: string; match: boolean }[] {
	if (!searchTerm) return [{ text, match: false }];
	const escapedTerms = searchTerm
		.trim()
		.split(/\s+/)
		.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.filter((term) => term.length > 0);
	if (escapedTerms.length === 0) return [{ text, match: false }];

	const pattern = `(${escapedTerms.join("|")})`;
	const parts = text.split(new RegExp(pattern, "i"));
	return parts
		.filter((part) => part !== "")
		.map((part) => ({
			text: part,
			match: new RegExp(`^${pattern}$`, "i").test(part),
		}));
}

/**
 * Renders `title` with the substrings matching `searchTerm` emboldened in the
 * primary color. When there's nothing to highlight, it renders a plain `Text`,
 * so it can be used as a drop-in title replacement on listing cards.
 */
export function HighlightedTitle({
	title,
	searchTerm,
	...textProps
}: {
	title: string;
	searchTerm?: string;
} & React.ComponentProps<typeof Text>) {
	const segments = splitBySearchTerm(title, searchTerm);

	if (segments.length <= 1) {
		return (
			<Text {...textProps} numberOfLines={textProps.numberOfLines}>
				{title}
			</Text>
		);
	}

	return (
		<Text {...textProps} numberOfLines={textProps.numberOfLines}>
			{/* biome-ignore-start lint/suspicious/noArrayIndexKey: segments derive from an immutable string, index is a stable identity */}
			{segments.map((segment, i) => (
				<Text
					key={`${segment.text}-${i}`}
					className={segment.match ? "font-extrabold text-primary" : undefined}
				>
					{segment.text}
				</Text>
			))}
			{/* biome-ignore-end lint/suspicious/noArrayIndexKey: end of stable-identity segment list */}
		</Text>
	);
}
