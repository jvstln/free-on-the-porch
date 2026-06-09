import type * as React from "react";
import { Switch as RNSwitch } from "react-native";
import { withUniwind } from "uniwind";

type SwitchProps = React.ComponentProps<typeof RNSwitch>;

function SwitchImpl({
	trackColor = { false: "#efeee9", true: "#316342" },
	thumbColor = "#ffffff",
	ios_backgroundColor = "#efeee9",
	...props
}: SwitchProps) {
	return (
		<RNSwitch
			trackColor={trackColor}
			thumbColor={thumbColor}
			ios_backgroundColor={ios_backgroundColor}
			{...props}
		/>
	);
}

export const Switch = withUniwind(SwitchImpl);
