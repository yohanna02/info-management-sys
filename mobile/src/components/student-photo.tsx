import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius } from "@/theme";

const SIZES = { sm: 40, lg: 120 } as const;
export type StudentPhotoSize = keyof typeof SIZES;

export interface StudentPhotoProps {
  url: string | null | undefined;
  name: string;
  size?: StudentPhotoSize;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/**
 * Renders a student photo, falling back to initials when no photo exists.
 * Uses `expo-image` so the rounded frame clips correctly on both platforms.
 */
export function StudentPhoto({ url, name, size = "sm" }: StudentPhotoProps) {
  const dimension = SIZES[size];
  const frame = {
    width: dimension,
    height: dimension,
    borderRadius: size === "lg" ? radius.lg : dimension / 2,
  };
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={frame}
        contentFit="cover"
        transition={150}
        accessibilityLabel={`${name}'s photo`}
      />
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={`No photo for ${name}`}
      style={[styles.fallback, frame]}
    >
      <Text style={[styles.initials, size === "lg" ? styles.initialsLg : null]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    color: colors.avatarText,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
  },
  initialsLg: {
    fontSize: fontSize.stat,
  },
});
