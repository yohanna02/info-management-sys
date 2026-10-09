import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fontSize, fontWeight } from "@/theme";

export interface HeaderButtonProps {
  label: string;
  onPress: () => void;
  /** Muted white variant for use on the primary-colored header. */
  onPrimary?: boolean;
}

/** Text button rendered in a navigator's `headerRight` slot. */
export function HeaderButton({ label, onPress, onPrimary = true }: HeaderButtonProps) {
  return (
    <Pressable hitSlop={10} accessibilityRole="button" onPress={onPress}>
      <Text style={[styles.label, onPrimary ? styles.onPrimary : styles.onSurface]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  onPrimary: {
    color: colors.onPrimary,
  },
  onSurface: {
    color: colors.primary,
  },
});
