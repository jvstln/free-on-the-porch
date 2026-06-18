import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
	type NativeSyntheticEvent,
	Pressable,
	TextInput,
	type TextInputKeyPressEventData,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";

type Props = {
	email: string;
	onVerify: (code: string) => Promise<void> | void;
	onResend?: () => void;
	onBack?: () => void;
	title?: string;
	description?: React.ReactNode;
	isLoading?: boolean;
	verifyLabel?: string;
};

export function OtpVerification({
	email,
	onVerify,
	onResend,
	onBack,
	title = "Verify Email",
	description,
	isLoading = false,
	verifyLabel = "Verify Code",
}: Props) {
	const { toast } = useToast();
	const [otp, setOtp] = useState(["", "", "", ""]);

	const otpRefs = [
		useRef<TextInput>(null),
		useRef<TextInput>(null),
		useRef<TextInput>(null),
		useRef<TextInput>(null),
	];

	// Focus first input on mount
	useEffect(() => {
		otpRefs[0]?.current?.focus();
	}, [otpRefs[0]?.current?.focus]);

	const handleOtpChange = (text: string, index: number) => {
		const newOtp = [...otp];
		newOtp[index] = text.slice(-1); // only keep last character
		setOtp(newOtp);

		// Auto focus next input
		if (text && index < 3) {
			otpRefs[index + 1]?.current?.focus();
		}
	};

	const handleOtpKeyPress = (
		e: NativeSyntheticEvent<TextInputKeyPressEventData>,
		index: number,
	) => {
		if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
			otpRefs[index - 1]?.current?.focus();
		}
	};

	const handleVerifyPress = () => {
		const enteredOtp = otp.join("");
		if (enteredOtp.length < 4) {
			toast.show({
				variant: "danger",
				label: "Please enter the full 4-digit code.",
			});
			return;
		}
		onVerify(enteredOtp);
	};

	return (
		<View className="gap-5">
			<View>
				<Text type="h3" className="mb-1 font-extrabold text-primary">
					{title}
				</Text>
				{description ? (
					description
				) : (
					<Text
						type="body-xs"
						className="text-muted-foreground leading-relaxed"
					>
						We've sent a 4-digit verification code to{" "}
						<Text type="body-xs" className="font-bold text-foreground">
							{email}
						</Text>
						. Enter it below (use code <Text className="font-bold">1234</Text>).
					</Text>
				)}
			</View>

			{/* 4 Digit Input Boxes */}
			<View className="flex-row justify-around py-2">
				{[
					{ id: "otp-0", index: 0 },
					{ id: "otp-1", index: 1 },
					{ id: "otp-2", index: 2 },
					{ id: "otp-3", index: 3 },
				].map(({ id, index }) => (
					<TextInput
						key={id}
						ref={otpRefs[index]}
						className="size-14 rounded-2xl border-2 border-border bg-background text-center font-bold text-foreground text-xl focus:border-primary"
						keyboardType="number-pad"
						maxLength={1}
						value={otp[index]}
						onChangeText={(text) => handleOtpChange(text, index)}
						onKeyPress={(e) => handleOtpKeyPress(e, index)}
						selectTextOnFocus
					/>
				))}
			</View>

			<Button
				size="lg"
				className="items-center justify-center rounded-xl py-3.5"
				onPress={handleVerifyPress}
				isLoading={isLoading}
				loadingText="Verifying..."
			>
				<Button.Label className="font-bold text-white">
					{verifyLabel}
				</Button.Label>
			</Button>

			{onResend && (
				<View className="mt-1 flex-row items-center justify-center gap-1.5">
					<Text type="body-xs" className="text-muted-foreground">
						Didn't get the code?
					</Text>
					<Pressable onPress={onResend}>
						<Text type="body-xs" className="font-bold text-primary underline">
							Resend
						</Text>
					</Pressable>
				</View>
			)}

			{onBack && (
				<Pressable
					onPress={onBack}
					className="mt-2 flex-row items-center justify-center gap-1.5 active:opacity-75"
				>
					<Icon as={ArrowLeft} className="size-4 text-muted-foreground" />
					<Text
						type="body-sm"
						className="font-bold text-muted-foreground text-sm"
					>
						Back
					</Text>
				</Pressable>
			)}
		</View>
	);
}
