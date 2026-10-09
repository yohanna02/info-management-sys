import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TokenStorage } from "@convex-dev/auth/react";

/**
 * `ConvexAuthProvider` defaults to `window.localStorage` and throws on mount
 * when there is none, which is the case in React Native. AsyncStorage is the
 * React Native equivalent that ships in Expo Go, so the auth token survives an
 * app restart.
 *
 * The Convex docs recommend `expo-secure-store` for production tokens. That
 * module needs a development build, so it is not used here; swap this adapter
 * for it if the app is only ever distributed as an EAS build.
 *
 * The object is module-level so its identity is stable across renders (the
 * provider's mount effect depends on `storageGet`).
 */
export const authStorage: TokenStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
