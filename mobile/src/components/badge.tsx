import { StyleSheet, Text, View } from "react-native";
import { fontSize, fontWeight, radius, statusPalette } from "@/theme";
import type { StudentStatus } from "@/utils/student";

export function StatusBadge({ status }: { status: StudentStatus }) {
  const palette = statusPalette[status];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: "capitalize",
  },
});
