import {
	type FlatListProps,
	type RefreshControlProps,
	FlatList as RNFlatList,
	RefreshControl as RNRefreshControl,
} from "react-native";
import { useResolveClassNames } from "uniwind";

export function RefreshControl({
	className,
	...props
}: RefreshControlProps & { className?: string }) {
	// Dynamically extract the text color from className (or fallback to text-primary)
	const styles = useResolveClassNames(className || "text-primary");
	const resolvedColor =
		typeof styles.color === "string" ? styles.color : "#316342";

	return (
		<RNRefreshControl
			tintColor={resolvedColor}
			colors={[resolvedColor]}
			{...props}
		/>
	);
}

export function FlatList<T>({
	refreshing,
	onRefresh,
	refreshControlProps,
	...props
}: FlatListProps<T> & {
	refreshing?: boolean;
	onRefresh?: () => void;
	refreshControlProps?: Omit<
		RefreshControlProps,
		"refreshing" | "onRefresh"
	> & { className?: string };
}) {
	const hasRefresh = refreshing !== undefined || onRefresh !== undefined;

	return (
		<RNFlatList
			showsVerticalScrollIndicator={false}
			showsHorizontalScrollIndicator={false}
			{...props}
			refreshControl={
				hasRefresh ? (
					<RefreshControl
						refreshing={refreshing || false}
						onRefresh={onRefresh}
						{...refreshControlProps}
					/>
				) : undefined
			}
		/>
	);
}
