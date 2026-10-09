// Expo entry point.
//
// `expo-router/entry` is the default entry; importing it here (instead of
// pointing "main" at it directly) lets us install the URL/FormData polyfills
// that the Convex client relies on before any app module is evaluated.
import "react-native-url-polyfill/auto";
import "expo-router/entry";
