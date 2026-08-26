import { env } from "@free-on-the-porch/env/public";
// import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// export const storage = createAsyncStorage(env.PUBLIC_APP_NAME);
export const storage = AsyncStorage;
