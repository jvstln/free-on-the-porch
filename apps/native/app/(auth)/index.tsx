// import { HeartIcon } from "lucide-react-native";
// import { ImageBackground, View } from "react-native";
// import { Image } from "expo-image";
// // import logoIconLight from "@free-on-the-pouch/assets/logo-icon-light.svg";
// import logoIconLight from "@/assets/images/logo-icon-light.svg";
// import porchImage from "@/assets/images/porch.jpg";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Icon } from "@/components/ui/icon";
// import { Text } from "@/components/ui/text";

// type Props = {};

// const OnboardingScreen = (props: Props) => {
//   return (
//     <View className="flex-1 bg-yellow-500 p-4">
//       <ImageBackground
//         source={porchImage}
//         imageClassName="rounded-xl opacity-80"
//         className="flex-1 items-start rounded-xl bg-secondary p-4"
//       >
//         <Badge color={"neutral"} inverted>
//           <Icon as={HeartIcon} />
//           <Text>Community Shared</Text>
//         </Badge>
//       </ImageBackground>

//       <View className="">
//         <Image
//           // source={logoIconLight}
//           source="https://picsum.photos/seed/696/3000/2000"
//           // className="size-32"
//           // contentFit="contain"
//         />
//       </View>

//       <Button>
//         <Text>Get started</Text>
//       </Button>
//     </View>
//   );
// };

// export default OnboardingScreen;

import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source="https://picsum.photos/seed/696/3000/2000"
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    backgroundColor: "#0553",
  },
});
