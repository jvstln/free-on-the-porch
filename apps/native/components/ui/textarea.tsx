import {
	TextArea as HeroUITextArea,
	type TextAreaProps as HeroUITextAreaProps,
} from "heroui-native";

type TextareaProps = HeroUITextAreaProps & {};

export const Textarea = (props: TextareaProps) => {
	return <HeroUITextArea {...props} />;
};
