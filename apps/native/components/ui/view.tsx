import React from "react";
import {
	KeyboardAvoidingView as KeyboardAvoidingViewPrimitive,
	ScrollView as ScrollViewPrimitive,
	View as ViewPrimitive,
} from "react-native";
import { SafeAreaView as SafeAreaViewPrimitive } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { cn } from "@/lib/utils";
import { getInheritableTextClassNames, TextClassContext } from "./text";

export const View = React.forwardRef<
	React.ElementRef<typeof ViewPrimitive>,
	React.ComponentProps<typeof ViewPrimitive>
>((props, ref) => {
	return (
		<TextClassContext.Provider
			value={getInheritableTextClassNames(props.className)}
		>
			<ViewPrimitive ref={ref} {...props} className={cn("", props.className)} />
		</TextClassContext.Provider>
	);
});
View.displayName = "View";

const ScrollViewWithUniwind = withUniwind(ScrollViewPrimitive);
export const ScrollView = (
	props: React.ComponentProps<typeof ScrollViewPrimitive>,
) => {
	return (
		<ScrollViewWithUniwind
			showsVerticalScrollIndicator={false}
			showsHorizontalScrollIndicator={false}
			{...props}
			className={cn("size-full flex-1", props.className)}
			contentContainerClassName={props.contentContainerClassName}
		/>
	);
};

const SafeAreaViewWithUniwind = withUniwind(SafeAreaViewPrimitive);
export const SafeAreaView = (
	props: React.ComponentProps<typeof SafeAreaViewPrimitive>,
) => {
	return (
		<SafeAreaViewWithUniwind {...props} className={cn("", props.className)} />
	);
};

export const KeyboardAvoidingView = (
	props: React.ComponentProps<typeof KeyboardAvoidingViewPrimitive>,
) => {
	return (
		<KeyboardAvoidingViewPrimitive
			{...props}
			className={cn("", props.className)}
		/>
	);
};
