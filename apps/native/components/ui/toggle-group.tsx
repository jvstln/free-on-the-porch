import type React from "react";
import { createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ScrollView, View } from "@/components/ui/view";
import { cn } from "@/lib/utils";

interface ToggleGroupContextValue {
	value: string | number | undefined;
	onValueChange: (value: string | number) => void;
	type: "pill" | "segmented";
	size: React.ComponentProps<typeof Button>["size"];
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext() {
	const context = useContext(ToggleGroupContext);
	if (!context) {
		throw new Error("ToggleGroupItem must be used within a ToggleGroup");
	}
	return context;
}

export interface ToggleGroupProps {
	/**
	 * Currently selected value
	 */
	value?: string | number;

	/**
	 * Callback fired when a value is selected
	 */
	onValueChange?: (value: string | number) => void;

	/**
	 * Preset visual styles:
	 * "pill": independent pill buttons (outline when inactive, solid when active)
	 * "segmented": connected ghost buttons in a muted background container
	 */
	type?: "pill" | "segmented";

	/**
	 * Size of the buttons
	 */
	size?: React.ComponentProps<typeof Button>["size"];

	/**
	 * Root container class name
	 */
	className?: string;

	/**
	 * Class applied to the content container (especially useful when scrollable)
	 */
	contentContainerClassName?: string;

	/**
	 * If true, wraps the toggle group in a horizontal ScrollView
	 */
	scrollable?: boolean;

	children?: React.ReactNode;
}

export function ToggleGroup({
	value,
	onValueChange,
	type = "pill",
	size = "xs",
	className,
	contentContainerClassName,
	scrollable = false,
	children,
}: ToggleGroupProps) {
	const isSegmented = type === "segmented";

	const content = (
		<ToggleGroupContext.Provider
			value={{
				value,
				onValueChange: onValueChange || (() => {}),
				type,
				size,
			}}
		>
			{children}
		</ToggleGroupContext.Provider>
	);

	if (scrollable) {
		return (
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className={cn("shrink-0 grow-0", className)}
				contentContainerClassName={cn(
					!isSegmented && "gap-2",
					contentContainerClassName,
				)}
			>
				{content}
			</ScrollView>
		);
	}

	return (
		<View
			className={cn(
				"flex-row items-center",
				isSegmented && "rounded-full bg-card p-0.5",
				!isSegmented && "flex-wrap gap-2",
				className,
			)}
		>
			{content}
		</View>
	);
}

export interface ToggleGroupItemProps {
	value: string | number;
	children: React.ReactNode;
	className?: string;
	color?: React.ComponentProps<typeof Button>["color"];
}

export function ToggleGroupItem({
	value,
	children,
	className,
	color = "primary",
}: ToggleGroupItemProps) {
	const context = useToggleGroupContext();
	const isActive = context.value === value;
	const isSegmented = context.type === "segmented";

	return (
		<Button
			onPress={() => context.onValueChange(value)}
			color={isActive ? color : "default"}
			appearance={isActive ? "solid" : isSegmented ? "ghost" : "outline"}
			size={context.size}
			className={cn(
				"rounded-full",
				isSegmented && "px-4",
				!isActive && isSegmented && "text-muted-foreground",
				className,
			)}
		>
			{children}
		</Button>
	);
}

ToggleGroup.Item = ToggleGroupItem;
