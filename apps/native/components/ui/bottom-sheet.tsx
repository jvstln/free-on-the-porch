import { BottomSheetScrollView as BottomSheetScrollViewPrimitive } from "@gorhom/bottom-sheet";

import {
	type BottomSheetCloseProps,
	type BottomSheetContentProps,
	type BottomSheetDescriptionProps,
	BottomSheet as BottomSheetHeroUi,
	type BottomSheetRootProps,
	type BottomSheetTitleProps,
	type BottomSheetTriggerProps,
} from "heroui-native/bottom-sheet";

function BottomSheet(props: BottomSheetRootProps) {
	return <BottomSheetHeroUi {...props} />;
}

function BottomSheetTrigger(props: BottomSheetTriggerProps) {
	return <BottomSheetHeroUi.Trigger {...props} />;
}

function BottomSheetContent(props: BottomSheetContentProps) {
	return (
		<BottomSheetHeroUi.Portal>
			<BottomSheetHeroUi.Overlay />
			<BottomSheetHeroUi.Content {...props} />
		</BottomSheetHeroUi.Portal>
	);
}

function BottomSheetClose(props: BottomSheetCloseProps) {
	return <BottomSheetHeroUi.Close {...props} />;
}

function BottomSheetTitle(props: BottomSheetTitleProps) {
	return <BottomSheetHeroUi.Title {...props} />;
}

function BottomSheetDescription(props: BottomSheetDescriptionProps) {
	return <BottomSheetHeroUi.Description {...props} />;
}

function BottomSheetScrollView(
	props: React.ComponentProps<typeof BottomSheetScrollViewPrimitive>,
) {
	return <BottomSheetScrollViewPrimitive {...props} />;
}

namespace BottomSheet {
	export type BottomSheetProps = React.ComponentProps<typeof BottomSheet>;
	export type BottomSheetCloseProps = React.ComponentProps<
		typeof BottomSheetClose
	>;
	export type BottomSheetContentProps = React.ComponentProps<
		typeof BottomSheetContent
	>;
	export type BottomSheetDescriptionProps = React.ComponentProps<
		typeof BottomSheetDescription
	>;
	export type BottomSheetTitleProps = React.ComponentProps<
		typeof BottomSheetTitle
	>;
	export type BottomSheetTriggerProps = React.ComponentProps<
		typeof BottomSheetTrigger
	>;
}

export {
	BottomSheet,
	BottomSheetClose,
	BottomSheetContent,
	BottomSheetDescription,
	BottomSheetScrollView,
	BottomSheetTitle,
	BottomSheetTrigger,
};
