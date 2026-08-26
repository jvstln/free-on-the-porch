import { SearchField } from "heroui-native";
import { cn } from "@/lib/utils";

export function SearchInput({
	value,
	onChange,
	className,
	placeholder,
	autoFocus,
	...props
}: SearchInput.Props) {
	return (
		<SearchField
			value={value}
			onChange={onChange}
			className={cn("grow")}
			{...props}
		>
			<SearchField.Group>
				<SearchField.SearchIcon />
				<SearchField.Input
					placeholder={placeholder}
					className={cn(className)}
					autoFocus={autoFocus}
				/>
				{/* <SearchField.ClearButton /> */}
			</SearchField.Group>
		</SearchField>
	);
}

namespace SearchInput {
	export type Props = React.ComponentProps<typeof SearchField> &
		Pick<React.ComponentProps<typeof SearchField.Input>, "autoFocus"> & {
			placeholder?: string;
		};
}
