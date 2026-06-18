// import { BottomSheet } from "heroui-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { LogoContained } from "@/components/logo";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetScrollView,
	BottomSheetTitle,
	BottomSheetTrigger,
} from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export const OnboardingSheet = ({
	isOpen,
	onOpenChange,
	isDefaultOpen,
	children,
}: Pick<
	BottomSheet.BottomSheetProps,
	"isOpen" | "onOpenChange" | "isDefaultOpen" | "children"
>) => {
	const [view, setView] = useState<"login" | "register">("login");

	return (
		<BottomSheet
			isDefaultOpen={isDefaultOpen}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		>
			{children && <BottomSheetTrigger asChild>{children}</BottomSheetTrigger>}
			<BottomSheetContent
				snapPoints={["90%"]}
				enableOverDrag={false}
				enableDynamicSizing={false}
				contentContainerClassName="h-full"
			>
				<BottomSheetScrollView>
					<View className="mb-8 items-center text-center">
						<LogoContained className="size-12" containerClassName="mb-4" />
						<BottomSheetTitle className="text-primary">
							Free on the Porch
						</BottomSheetTitle>
						<BottomSheetDescription>
							Please log in to continue.
						</BottomSheetDescription>
					</View>

					{view === "register" ? (
						<RegisterForm onSuccess={() => setView("login")} />
					) : (
						<LoginForm />
					)}

					<View className="mt-6 flex-row items-center justify-center">
						<Text type="body-sm" className="text-muted-foreground">
							{view === "register"
								? "Already a neighbor? "
								: "New to the porch? "}
						</Text>
						<Pressable
							onPress={() =>
								setView(view === "register" ? "login" : "register")
							}
						>
							<Text className="font-bold text-primary text-sm underline">
								{view === "register" ? "Log in here" : "Join the community"}
							</Text>
						</Pressable>
					</View>
				</BottomSheetScrollView>
			</BottomSheetContent>
		</BottomSheet>
	);
};
