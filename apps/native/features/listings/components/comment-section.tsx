import { getInitials } from "@free-on-the-porch/shared/utils";
import { Send, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { TextInput } from "react-native";
import { useResolveClassNames } from "uniwind";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { View } from "@/components/ui/view";
import {
	useComments,
	useCreateComment,
	useDeleteComment,
} from "@/features/comments/use-comments";

type Props = {
	listingId: string;
	currentUserId?: string;
};

export function CommentSection({ listingId, currentUserId }: Props) {
	const [body, setBody] = useState("");
	const { data: comments, isLoading } = useComments(listingId);
	const createMutation = useCreateComment(listingId);
	const deleteMutation = useDeleteComment(listingId);
	const placeholderStyles = useResolveClassNames("text-muted-foreground");
	const placeholderColor =
		typeof placeholderStyles.color === "string"
			? placeholderStyles.color
			: "#414942";

	const handleSubmit = async () => {
		const trimmed = body.trim();
		if (!trimmed) return;

		try {
			await createMutation.mutateAsync({ body: trimmed });
			setBody("");
		} catch {
			toast.error("Failed to post comment.");
		}
	};

	const handleDelete = (commentId: string) => {
		deleteMutation.mutate(commentId, {
			onSuccess: () => toast.success("Comment deleted."),
			onError: () => toast.error("Failed to delete comment."),
		});
	};

	if (isLoading) {
		return (
			<View className="items-center py-8">
				<Spinner className="size-6 text-primary" />
			</View>
		);
	}

	return (
		<View>
			{comments && comments.length > 0 ? (
				<View className="gap-4">
					{comments.map((comment) => (
						<View key={comment.id} className="flex-row gap-3">
							<Avatar className="mt-0.5">
								<Avatar.Image src={comment.user?.image} />
								<Avatar.Fallback>
									{getInitials(comment.user?.name ?? "")}
								</Avatar.Fallback>
							</Avatar>
							<View className="flex-1">
								<View className="flex-row items-center gap-2">
									<Text type="body-sm" className="font-bold text-foreground">
										{comment.user?.name || "Neighbor"}
									</Text>
									{currentUserId === comment.userId && (
										<Button
											appearance="ghost"
											color="destructive"
											className="size-6 p-0"
											onPress={() => handleDelete(comment.id)}
										>
											<Icon as={Trash2} className="size-3" />
										</Button>
									)}
								</View>
								<Text type="body-sm" className="mt-1 text-foreground">
									{comment.body}
								</Text>
							</View>
						</View>
					))}
				</View>
			) : (
				<Text type="body-sm" className="py-4 text-center text-muted-foreground">
					No comments yet. Be the first!
				</Text>
			)}

			{currentUserId && (
				<View className="mt-4 flex-row items-center gap-2">
					<TextInput
						className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-foreground text-sm"
						placeholder="Add a comment..."
						placeholderTextColor={placeholderColor}
						value={body}
						onChangeText={setBody}
						onSubmitEditing={handleSubmit}
						returnKeyType="send"
					/>
					<Button
						appearance="ghost"
						onPress={handleSubmit}
						disabled={!body.trim() || createMutation.isPending}
						isLoading={createMutation.isPending}
						className="size-10 p-0"
					>
						<Icon as={Send} className="size-5 text-primary" />
					</Button>
				</View>
			)}
		</View>
	);
}
