import { Spinner as HeroUiSpinner } from "heroui-native";
import { LoaderCircle } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { Icon } from "./icon";
import { useInheritableTextClassContext } from "./text";
import { View } from "./view";

namespace Spinner {
	export type Props = React.ComponentProps<typeof HeroUiSpinner>;
}

function Spinner({ className, ...props }: Spinner.Props) {
	const textClassName = useInheritableTextClassContext();

	return (
		<HeroUiSpinner {...props}>
			<HeroUiSpinner.Indicator>
				<Icon as={LoaderCircle} className={cn(textClassName, className)} />
			</HeroUiSpinner.Indicator>
		</HeroUiSpinner>
	);
}

function LoadingScreen() {
	return (
		<View className="flex-1 items-center justify-center">
			<View className="rounded-xl bg-primary p-2">
				<Logo className="size-20 text-white" />
			</View>
		</View>
	);
}

export { LoadingScreen, Spinner };
