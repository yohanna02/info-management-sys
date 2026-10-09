import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  style,
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const spinnerColor = variant === "secondary" ? colors.text : colors.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        variantStyles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={spinnerColor} /> : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          size === "sm" ? styles.labelSm : null,
          labelStyles[variant],
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  md: {
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
    minHeight: 40,
  },
  sm: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 32,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  labelSm: {
    fontSize: fontSize.md,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  danger: { backgroundColor: colors.danger },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.onPrimary },
  secondary: { color: colors.text },
  danger: { color: colors.onPrimary },
});
