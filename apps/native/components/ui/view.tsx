import type React from "react";
import {
  ScrollView as ScrollViewPrimitive,
  type View as ViewPrimitive,
} from "react-native";
import { cn } from "@/lib/utils";

export const View = (props: React.ComponentProps<typeof ViewPrimitive>) => {
  return (
    <View {...props} className={cn("size-full flex-1", props.className)} />
  );
};

export const ScrollView = (
  props: React.ComponentProps<typeof ScrollViewPrimitive>,
) => {
  return (
    <ScrollViewPrimitive
      {...props}
      className={cn("size-full flex-1", props.className)}
      contentContainerClassName={cn("grow", props.contentContainerClassName)}
    />
  );
};
