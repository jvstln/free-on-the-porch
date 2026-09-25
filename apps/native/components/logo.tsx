import logoIcon from "@free-on-the-porch/shared/assets/logo-icon.svg";
import logoIconLight from "@free-on-the-porch/shared/assets/logo-icon-light.svg";
import Animated from "react-native-reanimated";
import { cn } from "@/lib/utils";
import { Image } from "./ui/image";

type LogoProps = React.ComponentProps<typeof Image>;

export const Logo = ({ className, ...props }: LogoProps) => {
	return (
		<Image
			className={cn("w-[100px] bg-emerald-400", className)}
			source={logoIcon}
			// style={{ width: 200, height: 300 }}
			{...props}
		/>
	);
};

export const LogoLight = ({ className, ...props }: LogoProps) => {
	return (
		<Image
			className={cn("size-24", className)}
			source={logoIconLight}
			{...props}
		/>
	);
};

const floatAndRock = {
	from: {
		transform: [{ translateY: -3 }, { rotate: "-7deg" }],
	},
	to: {
		transform: [{ translateY: 3 }, { rotate: "13deg" }],
	},
};

export const AnimatedLogo = ({
	className,
	containerClassName,
	...props
}: LogoProps & { containerClassName?: string }) => {
	return (
		<Animated.View
			className={containerClassName}
			style={{
				animationName: floatAndRock,
				animationDuration: "2200ms",
				animationTimingFunction: "ease-in-out",
				animationIterationCount: "infinite",
				animationDirection: "alternate",
			}}
		>
			<Logo className={className} {...props} />
		</Animated.View>
	);
};
