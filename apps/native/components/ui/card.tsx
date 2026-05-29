import { Card as HeroUICard } from "heroui-native";
import { cn } from "@/lib/utils";

type CardRootProps = React.ComponentProps<typeof HeroUICard>;
type CardHeaderProps = React.ComponentProps<typeof HeroUICard.Header>;
type CardTitleProps = React.ComponentProps<typeof HeroUICard.Title>;
type CardDescriptionProps = React.ComponentProps<typeof HeroUICard.Description>;
type CardBodyProps = React.ComponentProps<typeof HeroUICard.Body>;
type CardFooterProps = React.ComponentProps<typeof HeroUICard.Footer>;

const CardRoot = (props: CardRootProps) => (
	<HeroUICard {...props} className={cn("py-6", props.className)} />
);

const CardHeader = (props: CardHeaderProps) => (
	<HeroUICard.Header {...props} className={cn("mb-6", props.className)} />
);

const CardTitle = (props: CardTitleProps) => <HeroUICard.Title {...props} />;

const CardDescription = (props: CardDescriptionProps) => (
	<HeroUICard.Description {...props} />
);

const CardBody = (props: CardBodyProps) => <HeroUICard.Body {...props} />;

const CardFooter = (props: CardFooterProps) => (
	<HeroUICard.Footer {...props} className={cn("mt-6", props.className)} />
);

export const Card = Object.assign(CardRoot, {
	Header: CardHeader,
	Title: CardTitle,
	Description: CardDescription,
	Body: CardBody,
	Footer: CardFooter,
});
