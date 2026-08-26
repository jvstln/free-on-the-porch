import type { UseQueryResult } from "@tanstack/react-query";
import { AlertCircle, SearchX } from "lucide-react-native";
import { isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";
import { Spinner } from "./spinner";
import { Text } from "./text";
import { View } from "./view";

export type EmptyStateProps = {
	title: ReactNode;
	description: ReactNode;
	cta: ReactNode;
};

export type QueryStateProps<
	TData = unknown,
	TQuery extends Partial<UseQueryResult<TData>> = Partial<
		UseQueryResult<TData>
	>,
> = {
	query: TQuery;
	children?:
		| ReactNode
		| ((query: Extract<TQuery, { data: NonNullable<TData> }>) => ReactNode);

	getIsLoading?: (query: TQuery) => boolean | ReactNode;
	getIsError?: (query: TQuery) => boolean | string;
	getIsEmpty?: (
		query: Extract<TQuery, { data: NonNullable<TData> }>,
	) => boolean | string | EmptyStateProps;
};

type ErrorStateProps = {
	query?: QueryStateProps["query"];
	classNames?: Partial<
		Record<"errorRoot" | "root" | "error" | "button", string>
	>;
	errorMessage?: string;
};

const ErrorState = ({ query, errorMessage, classNames }: ErrorStateProps) => {
	const refetch = query?.refetch;
	return (
		<View
			className={cn(
				"flex-1 items-center justify-center px-8 py-20",
				classNames?.root,
				classNames?.errorRoot,
			)}
		>
			<View className="mb-8 items-center justify-center">
				<View className="absolute size-24 rounded-full bg-destructive/10 opacity-40" />
				<View className="size-16 rotate-3 items-center justify-center rounded-2xl bg-destructive/10">
					<Icon
						as={AlertCircle}
						className="size-8 -rotate-3 text-destructive"
					/>
				</View>
			</View>

			<Text
				type="h3"
				weight="bold"
				className="mb-2 text-center text-destructive"
			>
				Something went wrong
			</Text>

			<Text
				type="body-sm"
				className="mb-8 text-center text-muted-foreground leading-relaxed"
			>
				{errorMessage ??
					(query?.error as Error)?.message ??
					"An error occurred"}
			</Text>

			{refetch && (
				<Button
					onPress={() => refetch()}
					className={cn(classNames?.button)}
					appearance="soft"
					color="destructive"
				>
					Try Again
				</Button>
			)}
		</View>
	);
};

type LoadingStateProps = {
	classNames?: Partial<Record<"loadingRoot" | "root", string>>;
	loadingText?: string;
};

const LoadingState = ({ classNames, loadingText }: LoadingStateProps) => {
	return (
		<View
			className={cn(
				"flex-1 items-center justify-center px-6 py-20",
				classNames?.root,
				classNames?.loadingRoot,
			)}
		>
			<View className="mb-6 rounded-2xl bg-muted/50 p-4">
				<Spinner className="size-8 text-primary" />
			</View>
			{loadingText && (
				<Text type="body-sm" className="text-center font-bold text-foreground">
					{loadingText}
				</Text>
			)}
		</View>
	);
};

const EmptyState = ({
	title = "No results found",
	description,
	cta,
}: Partial<EmptyStateProps>) => {
	return (
		<View className="flex-1 items-center justify-center px-8 py-20">
			<View className="mb-8 items-center justify-center">
				<View className="absolute size-24 rounded-full bg-primary/10 opacity-50" />
				<View className="absolute size-16 rounded-full bg-primary/10 opacity-80" />
				<View className="size-20 items-center justify-center rounded-full border border-primary/20 border-dashed bg-primary/10">
					<Icon as={SearchX} className="size-8 text-primary" />
				</View>
			</View>

			{typeof title === "string" ? (
				<Text
					type="h3"
					className="mb-2.5 text-center font-extrabold text-foreground"
				>
					{title}
				</Text>
			) : (
				title
			)}

			{description &&
				(typeof description === "string" ? (
					<Text
						type="body-sm"
						className="mb-8 text-center text-muted-foreground leading-relaxed"
					>
						{description}
					</Text>
				) : (
					description
				))}

			{cta}
		</View>
	);
};

function hasData<
	TData,
	TQuery extends Partial<UseQueryResult<TData>> = Partial<
		UseQueryResult<TData>
	>,
>(query: TQuery): query is Extract<TQuery, { data: NonNullable<TData> }> {
	return query.data !== undefined && query.data !== null;
}

export function QueryState<
	TData,
	TQuery extends Partial<UseQueryResult<TData>>,
>({
	query,
	getIsLoading,
	getIsError,
	getIsEmpty,
	children,
}: QueryStateProps<TData, TQuery>) {
	const possibleLoadingMessage = getIsLoading?.(query);
	const possibleErrorMessage = getIsError?.(query);
	const possibleEmptyMessage = hasData<TData>(query)
		? getIsEmpty?.(query)
		: false;

	if (getIsLoading ? possibleLoadingMessage : query?.isPending) {
		if (isValidElement(possibleLoadingMessage)) return possibleLoadingMessage;

		return (
			<LoadingState
				loadingText={
					typeof possibleLoadingMessage === "string"
						? possibleLoadingMessage
						: undefined
				}
			/>
		);
	}

	if (getIsError ? possibleErrorMessage : query?.error || query?.isError) {
		return (
			<ErrorState
				query={query}
				errorMessage={
					typeof possibleErrorMessage === "string"
						? possibleErrorMessage
						: undefined
				}
			/>
		);
	}

	if (possibleEmptyMessage) {
		let title: ReactNode;
		let cta: ReactNode;
		let description: ReactNode;

		if (typeof possibleEmptyMessage === "boolean") {
			title = "No data available";
		} else if (typeof possibleEmptyMessage === "string") {
			title = possibleEmptyMessage;
		} else {
			({ title, description, cta } = possibleEmptyMessage);
		}

		return <EmptyState title={title} description={description} cta={cta} />;
	}

	if (!hasData<TData>(query)) return null;

	return typeof children === "function" ? children(query) : children;
}
