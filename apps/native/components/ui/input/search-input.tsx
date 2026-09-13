import { SearchField } from "heroui-native";
import type React from "react";
import type { View as RNView, TextInput } from "react-native";
import { View } from "@/components/ui/view";
import { cn } from "@/lib/utils";

export function SearchInput({
	value,
	onChange,
	className,
	placeholder,
	autoFocus,
	inputRef,
	containerRef,
	onFocus,
	onBlur,
	onSubmitEditing,
	returnKeyType = "search",
	...props
}: SearchInput.Props) {
	return (
		<View
			ref={containerRef}
			className={cn("grow", className)}
			nativeID="search-input-container"
		>
			<SearchField
				value={value}
				onChange={onChange}
				className="w-full"
				{...props}
			>
				<SearchField.Group>
					<SearchField.SearchIcon />
					<SearchField.Input
						ref={inputRef}
						placeholder={placeholder}
						autoFocus={autoFocus}
						onFocus={onFocus}
						onBlur={onBlur}
						onSubmitEditing={onSubmitEditing}
						returnKeyType={returnKeyType}
					/>
				</SearchField.Group>
			</SearchField>
		</View>
	);
}

namespace SearchInput {
	export type Props = React.ComponentProps<typeof SearchField> &
		Pick<
			React.ComponentProps<typeof SearchField.Input>,
			"autoFocus" | "onFocus" | "onBlur" | "onSubmitEditing" | "returnKeyType"
		> & {
			placeholder?: string;
			inputRef?: React.Ref<TextInput>;
			containerRef?: React.Ref<RNView>;
		};
}
