import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { authStorage } from "@/utils/auth-storage";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

// `unsavedChangesWarning` is a browser-only behaviour that is meaningless in
// React Native.
const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  if (!convex) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>Missing EXPO_PUBLIC_CONVEX_URL</Text>
        <Text style={styles.missingBody}>
          Create mobile/.env.local with EXPO_PUBLIC_CONVEX_URL pointing at your
          Convex deployment, then restart the dev server.
        </Text>
      </View>
    );
  }

  return (
    <ConvexAuthProvider client={convex} storage={authStorage}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.onPrimary,
            headerTitleStyle: { fontWeight: fontWeight.semibold },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen name="student/new" options={{ title: "Add student" }} />
          {/* Only direct children belong here. `student/[id]/edit` is a
              screen of the nested `student/[id]/_layout.tsx` stack, and
              declaring it here makes React Navigation warn that no such
              route exists in this navigator. */}
          <Stack.Screen name="student/[id]" options={{ title: "Student" }} />
          <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
        </Stack>
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  missingTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  missingBody: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
  },
});
