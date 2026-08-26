import { Stack, useLocalSearchParams } from "expo-router";
import { MessageThreadPage } from "@/features/messaging/components/message-thread-page";

export default function MessageThreadRoute() {
	const { threadId } = useLocalSearchParams<{ threadId: string }>();

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<MessageThreadPage threadId={threadId} />
		</>
	);
}
