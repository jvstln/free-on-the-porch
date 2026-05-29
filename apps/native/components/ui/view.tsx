import type React from "react";
import {
	KeyboardAvoidingView as KeyboardAvoidingViewPrimitive,
	ScrollView as ScrollViewPrimitive,
	View as ViewPrimitive,
} from "react-native";
import { SafeAreaView as SafeAreaViewPrimitive } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { cn } from "@/lib/utils";
import { getInheritableTextClassNames, TextClassContext } from "./text";

export const View = (props: React.ComponentProps<typeof ViewPrimitive>) => {
	return (
		<TextClassContext.Provider
			value={getInheritableTextClassNames(props.className)}
		>
			<ViewPrimitive {...props} className={cn("", props.className)} />
		</TextClassContext.Provider>
	);
};

export const ScrollView = (
	props: React.ComponentProps<typeof ScrollViewPrimitive>,
) => {
	return (
		<ScrollViewPrimitive
			{...props}
			className={cn("size-full flex-1", props.className)}
			contentContainerClassName={cn("grow", props.contentContainerClassName)}
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
