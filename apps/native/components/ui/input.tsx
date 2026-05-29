import { InputGroup } from "heroui-native";
import { EyeIcon, EyeOffIcon, type LucideIcon } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Pressable } from "react-native";
import { Icon } from "./icon";

type InputProps = React.ComponentProps<typeof InputGroup.Input> & {
	type?: "text" | "password" | "number" | "email";
	icon?: LucideIcon;
};

export function Input({ type, icon, ...props }: InputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<InputGroup>
			{icon && (
				<InputGroup.Prefix>
					<Icon as={icon} />
				</InputGroup.Prefix>
			)}
			<InputGroup.Input
				secureTextEntry={type === "password" ? !showPassword : undefined}
				keyboardType={
					type === "email"
						? "email-address"
						: type === "number"
							? "numeric"
							: undefined
				}
				{...props}
			/>
			<InputGroup.Suffix>
				{type === "password" && (
					<Pressable onPress={() => setShowPassword(!showPassword)}>
						<Icon as={showPassword ? EyeOffIcon : EyeIcon} />
					</Pressable>
				)}
			</InputGroup.Suffix>
		</InputGroup>
	);
}
