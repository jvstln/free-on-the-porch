import { useToast as useHeroToast } from "heroui-native";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

// Capture native toast manager reference at runtime
let toastRef: ReturnType<typeof useHeroToast>["toast"] | null = null;

export const ToastListener = () => {
	const { toast } = useHeroToast();
	React.useEffect(() => {
		toastRef = toast;
	}, [toast]);
	return null;
};

export interface ToastOptions {
	title?: string;
	label?: string;
	description?: string;
	variant?: "default" | "accent" | "success" | "warning" | "danger" | "error";
	duration?: number | "persistent";
	icon?: React.ReactNode;
	action?: {
		label: string;
		onClick: (helpers: {
			show: typeof toast;
			hide: (ids?: string | string[] | "all") => void;
		}) => void;
	};
	actionLabel?: string;
	onActionPress?: (helpers: { show: any; hide: (ids?: any) => void }) => void;
	id?: string;
	onShow?: () => void;
	onHide?: () => void;
	isSwipeable?: boolean;
}

function showToast(
	messageOrOptions: string | ToastOptions,
	options?: ToastOptions,
) {
	if (!toastRef) {
		console.warn(
			"Toast is not initialized yet. Ensure <ToastListener /> is mounted inside RootProviders.",
		);
		return undefined;
	}

	let finalOptions: any = {};

	if (typeof messageOrOptions === "string") {
		finalOptions = {
			label: messageOrOptions,
			...options,
		};
	} else {
		finalOptions = { ...messageOrOptions };
	}

	// Map title to label
	if (finalOptions.title && !finalOptions.label) {
		finalOptions.label = finalOptions.title;
	}
	delete finalOptions.title;

	// Map variant: error -> danger
	if (finalOptions.variant === "error") {
		finalOptions.variant = "danger";
	}

	// Map Sonner's action: { label, onClick } to HeroUI: actionLabel, onActionPress
	if (
		finalOptions.action &&
		!finalOptions.actionLabel &&
		!finalOptions.onActionPress
	) {
		finalOptions.actionLabel = finalOptions.action.label;
		finalOptions.onActionPress = (helpers: any) => {
			finalOptions.action.onClick(helpers);
		};
	}
	delete finalOptions.action;

	// If the toast is being updated (i.e., id is provided), hide the previous one first
	// and delete the id so that HeroUI Native's toast manager doesn't ignore the new toast.
	if (finalOptions.id) {
		toastRef.hide(finalOptions.id);
		delete finalOptions.id;
	}

	return toastRef.show(finalOptions);
}

export const toast = (
	messageOrOptions: string | ToastOptions,
	options?: ToastOptions,
) => {
	return showToast(messageOrOptions, options);
};

toast.success = (
	messageOrOptions: string | ToastOptions,
	options?: ToastOptions,
) => {
	const parsed =
		typeof messageOrOptions === "string"
			? { label: messageOrOptions, ...options }
			: messageOrOptions;
	return showToast({ ...parsed, variant: "success" });
};

toast.error = (
	messageOrOptions: string | ToastOptions,
	options?: ToastOptions,
) => {
	const parsed =
		typeof messageOrOptions === "string"
			? { label: messageOrOptions, ...options }
			: messageOrOptions;
	return showToast({ ...parsed, variant: "danger" });
};

toast.danger = toast.error;

toast.warning = (
	messageOrOptions: string | ToastOptions,
	options?: ToastOptions,
) => {
	const parsed =
		typeof messageOrOptions === "string"
			? { label: messageOrOptions, ...options }
			: messageOrOptions;
	return showToast({ ...parsed, variant: "warning" });
};

toast.warn = toast.warning;

toast.loading = (
	messageOrOptions: string | ToastOptions,
	options?: ToastOptions,
) => {
	const parsed =
		typeof messageOrOptions === "string"
			? { label: messageOrOptions, ...options }
			: messageOrOptions;
	return showToast({
		duration: "persistent",
		icon: React.createElement(Spinner),
		...parsed,
		variant: "default",
	});
};

toast.dismiss = (ids?: string | string[] | "all") => {
	if (toastRef) {
		toastRef.hide(ids);
	}
};

toast.hide = toast.dismiss;

// Maintain backwards compatibility if anything still needs it
export const useToast = () => {
	const original = useHeroToast();
	return {
		...original,
		toast: {
			...original.toast,
			show: showToast,
		},
	};
};
