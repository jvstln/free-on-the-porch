import { Typography } from "heroui-native";
import * as React from "react";
import { cn } from "@/lib/utils";

// const textVariants = cva(
// 	cn(
// 		"text-base text-foreground",
// 		Platform.select({
// 			web: "select-text",
// 		}),
// 	),
// 	{
// 		variants: {
// 			variant: {
// 				default: "",
// 				h1: cn(
// 					"text-center font-extrabold text-4xl tracking-tight",
// 					Platform.select({ web: "scroll-m-20 text-balance" }),
// 				),
// 				h2: cn(
// 					"border-border border-b pb-2 font-semibold text-3xl tracking-tight",
// 					Platform.select({ web: "scroll-m-20 first:mt-0" }),
// 				),
// 				h3: cn(
// 					"font-semibold text-2xl tracking-tight",
// 					Platform.select({ web: "scroll-m-20" }),
// 				),
// 				h4: cn(
// 					"font-semibold text-xl tracking-tight",
// 					Platform.select({ web: "scroll-m-20" }),
// 				),
// 				p: "mt-3 leading-7 sm:mt-6",
// 				blockquote: "mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6",
// 				code: cn(
// 					"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
// 				),
// 				lead: "text-muted-foreground text-xl",
// 				large: "font-semibold text-lg",
// 				small: "font-medium text-sm leading-none",
// 				muted: "text-muted-foreground text-sm",
// 			},
// 		},
// 		defaultVariants: {
// 			variant: "default",
// 		},
// 	},
// );

// type TextVariantProps = VariantProps<typeof textVariants>;

// type TextVariant = NonNullable<TextVariantProps["variant"]>;

// const ROLE: Partial<Record<TextVariant, Role>> = {
// 	h1: "heading",
// 	h2: "heading",
// 	h3: "heading",
// 	h4: "heading",
// 	blockquote: Platform.select({ web: "blockquote" as Role }),
// 	code: Platform.select({ web: "code" as Role }),
// };

// const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
// 	h1: "1",
// 	h2: "2",
// 	h3: "3",
// 	h4: "4",
// };

// function Text({
// 	className,
// 	asChild = false,
// 	variant = "default",
// 	...props
// }: React.ComponentProps<typeof RNText> &
// 	React.RefAttributes<typeof RNText> &
// 	TextVariantProps & {
// 		asChild?: boolean;
// 	}) {
// 	const textClass = React.useContext(TextClassContext);
// 	const Component = asChild ? Slot : RNText;

// 	return (
// 		<Component
// 			className={cn(textVariants({ variant }), textClass, className)}
// 			role={variant ? ROLE[variant] : undefined}
// 			aria-level={variant ? ARIA_LEVEL[variant] : undefined}
// 			{...props}
// 		/>
// 	);
// }

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
