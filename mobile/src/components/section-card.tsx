import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { Card } from "@/components/card";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

export interface SectionCardProps {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A card with an uppercase section heading, mirroring `.card` + `h2` on web. */
export function SectionCard({ title, children, action, style }: SectionCardProps) {
  return (
    <Card style={style}>
      {title || action ? (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {action}
        </View>
      ) : null}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.textMuted,
  },
});
