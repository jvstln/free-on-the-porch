import { SearchField } from "heroui-native";
import { cn } from "@/lib/utils";

export function SearchInput({
	value,
	onChange,
	className,
	placeholder,
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
				/>
				{/* <SearchField.ClearButton /> */}
			</SearchField.Group>
		</SearchField>
	);
}

namespace SearchInput {
	export type Props = React.ComponentProps<typeof SearchField> & {
		placeholder?: string;
	};
}
