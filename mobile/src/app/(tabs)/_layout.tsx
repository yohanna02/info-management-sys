import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { useConvexAuth } from "convex/react";
import { Redirect, router, Tabs } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { HeaderButton } from "@/components/header-button";
import { LoadingView } from "@/components/loading-view";
import { colors, fontSize, spacing } from "@/theme";

export default function TabsLayout() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (isLoading) return <LoadingView />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  function confirmSignOut() {
    Alert.alert("Sign out", "Sign out of the admin console?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontSize: fontSize.xl },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.bg },
        headerRight: () => (
          <View style={styles.headerActions}>
            <HeaderButton
              label="+ Add"
              onPress={() => router.navigate("/student/new")}
            />
            <HeaderButton label="Sign out" onPress={confirmSignOut} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginRight: spacing.xs,
  },
});
