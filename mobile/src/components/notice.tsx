import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { colors, fontSize, radius, spacing } from "@/theme";

export interface NoticeProps {
  kind?: "error" | "info";
  children: ReactNode;
}

export function Notice({ kind = "error", children }: NoticeProps) {
  const palette =
    kind === "error"
      ? { bg: colors.dangerBg, fg: colors.danger, border: colors.dangerBorder }
      : { bg: colors.infoBg, fg: colors.info, border: colors.infoBorder };
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.notice,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.text, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
    paddingHorizontal: spacing.lg - 2,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.base,
  },
});
