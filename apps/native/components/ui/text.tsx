import { Typography } from "heroui-native";
import * as React from "react";
import { cn } from "@/lib/utils";

export const getInheritableTextClassNames = (className = "") => {
	return className
		.split(" ")
		.filter((c) => /^text-.+$|^\[--.+|underline$/.test(c))
		.join(" ");
};

const Text = (props: React.ComponentProps<typeof Typography>) => {
	const textClassName = useInheritableTextClassContext();

	return (
		<Typography {...props} className={cn(textClassName, props.className)} />
	);
};

const TextClassContext = React.createContext<string | undefined>(undefined);
export const TextClassContextProvider = TextClassContext.Provider;

export const useTextClassContext = () => {
	return React.useContext(TextClassContext);
};

export const useInheritableTextClassContext = () => {
	const allClassName = React.useContext(TextClassContext);
	return getInheritableTextClassNames(allClassName);
};

export { Text, TextClassContext };
