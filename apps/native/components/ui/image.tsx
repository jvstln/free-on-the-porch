import {
	Image as ExpoImage,
	ImageBackground as ExpoImageBackground,
} from "expo-image";
import { withUniwind } from "uniwind";

export const Image = withUniwind(ExpoImage);

export const ImageBackground = withUniwind(ExpoImageBackground);
