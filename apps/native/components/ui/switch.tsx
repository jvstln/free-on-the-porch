import type * as React from "react";
import { Switch as RNSwitch } from "react-native";
import { useResolveClassNames } from "uniwind";

type SwitchProps = React.ComponentProps<typeof RNSwitch>;

function SwitchImpl({
	trackColor,
	thumbColor,
	ios_backgroundColor,
	...props
}: SwitchProps) {
	const resolvedPrimary = useResolveClassNames("bg-primary");
	const resolvedMuted = useResolveClassNames("bg-surface");

	const primaryColor =
		typeof resolvedPrimary.backgroundColor === "string"
			? resolvedPrimary.backgroundColor
			: "#316342";
	const mutedColor =
		typeof resolvedMuted.backgroundColor === "string"
			? resolvedMuted.backgroundColor
			: "#efeee9";

	const defaultTrackColor = trackColor ?? {
		false: mutedColor,
		true: primaryColor,
	};
	const defaultThumbColor = thumbColor ?? "#ffffff";
	const defaultIosBg = ios_backgroundColor ?? mutedColor;

	return (
		<RNSwitch
			trackColor={defaultTrackColor}
			thumbColor={defaultThumbColor}
			ios_backgroundColor={defaultIosBg}
			{...props}
		/>
	);
}

export { SwitchImpl as Switch };
