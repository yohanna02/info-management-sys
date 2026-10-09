import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "@/theme";

export interface DetailItem {
  label: string;
  value: string | number | null | undefined;
  /** Span the full row width. */
  full?: boolean;
}

export function DetailGrid({ items }: { items: DetailItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.cell, item.full ? styles.cellFull : null]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{formatValue(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

function formatValue(value: DetailItem["value"]): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.sm,
  },
  cell: {
    width: "50%",
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  cellFull: {
    width: "100%",
  },
  label: {
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
});
