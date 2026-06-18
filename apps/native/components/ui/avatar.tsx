import {
	Avatar as HeroUiAvatar,
	type AvatarImageProps as HeroUiAvatarImageProps,
} from "heroui-native";

const AvatarRoot = (props: React.ComponentProps<typeof HeroUiAvatar>) => {
	return <HeroUiAvatar {...props} />;
};

const AvatarImage = ({ ...props }: Avatar.AvatarImageProps) => {
	return <HeroUiAvatar.Image {...props} src={props.src ?? undefined} />;
};

const AvatarFallback = (
	props: React.ComponentProps<typeof HeroUiAvatar.Fallback>,
) => {
	return <HeroUiAvatar.Fallback {...props} />;
};

export const Avatar = Object.assign(AvatarRoot, {
	Image: AvatarImage,
	Fallback: AvatarFallback,
});

namespace Avatar {
	// export type AvatarImageProps = Omit<
	// 	React.ComponentProps<typeof HeroUiAvatar.Image>,
	// 	"source"
	// > & {
	// 	source?: HeroUiAvatarImageProps | React.Ref<typeof Image>;
	// };

	export type AvatarImageProps = {
		src?: null | HeroUiAvatarImageProps["src"];
	};
}
