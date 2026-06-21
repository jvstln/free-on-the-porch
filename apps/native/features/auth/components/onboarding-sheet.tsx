import { useState } from "react";
import { LogoContained } from "@/components/logo";
import {
	BottomSheet,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetScrollView,
	BottomSheetTitle,
	BottomSheetTrigger,
} from "@/components/ui/bottom-sheet";
import { LinkButton } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { EmailVerificationView } from "./email-verification-view";
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
	const [view, setView] = useState<"login" | "register" | "verify">("login");
	const [email, setEmail] = useState("");

	const showHeaderAndFooter = view !== "verify";

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
					{showHeaderAndFooter && (
						<View className="mb-8 items-center text-center">
							<LogoContained className="size-12" containerClassName="mb-4" />
							<BottomSheetTitle className="text-primary">
								Free on the Porch
							</BottomSheetTitle>
							<BottomSheetDescription>
								Please log in to continue.
							</BottomSheetDescription>
						</View>
					)}

					{view === "register" && (
						<RegisterForm
							onRegister={(regEmail) => {
								setEmail(regEmail);
								setView("verify");
							}}
						/>
					)}

					{view === "login" && (
						<LoginForm
							onUnverifiedEmail={(unverifiedEmail) => {
								setEmail(unverifiedEmail);
								setView("verify");
							}}
						/>
					)}

					{view === "verify" && (
						<EmailVerificationView
							email={email}
							onProceedToLogin={() => setView("login")}
						/>
					)}

					{showHeaderAndFooter && (
						<View className="mt-6 flex-row items-center justify-center">
							<Text type="body-sm" className="text-muted-foreground">
								{view === "register"
									? "Already a neighbor? "
									: "New to the porch? "}
							</Text>
							<LinkButton
								size="sm"
								onPress={() => setView(view === "register" ? "login" : "register")}
							>
								{view === "register" ? "Log in here" : "Join the community"}
							</LinkButton>
						</View>
					)}
				</BottomSheetScrollView>
			</BottomSheetContent>
		</BottomSheet>
	);
};
