import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "@/theme";

export interface LoadingViewProps {
  label?: string;
  /** Render inline (for list footers) instead of filling the screen. */
  inline?: boolean;
}

export function LoadingView({ label = "Loading…", inline = false }: LoadingViewProps) {
  if (inline) {
    return (
      <View style={styles.inline}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.full}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
