import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

export function NotFoundScreen() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.body}>
          The page you are looking for does not exist.
        </Text>
        <Link href="/" asChild>
          <Pressable accessibilityRole="link" style={styles.link}>
            <Text style={styles.linkText}>Go to dashboard</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  card: {
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
  },
  link: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
