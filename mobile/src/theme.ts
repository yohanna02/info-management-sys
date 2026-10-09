import { Platform, type ViewStyle } from "react-native";
import type { StudentStatus } from "@/utils/student";

/**
 * Light-only palette ported from the web app's CSS custom properties in
 * `src/index.css` so both clients share the same look. The web app had no
 * dark mode, so neither does this one.
 */
export const colors = {
  primary: "#1e3a8a",
  primaryDark: "#1e40af",
  primaryLight: "#3b82f6",
  accent: "#f59e0b",
  bg: "#f5f7fb",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  surfaceMuted: "#f1f5f9",
  border: "#e5e7eb",
  borderStrong: "#cbd5e1",
  text: "#1f2937",
  textMuted: "#6b7280",
  danger: "#dc2626",
  dangerDark: "#b91c1c",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  success: "#16a34a",
  successBg: "#ecfdf5",
  info: "#1d4ed8",
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
  warning: "#d97706",
  warningBg: "#fffbeb",
  neutralBg: "#f3f4f6",
  neutralText: "#4b5563",
  onPrimary: "#ffffff",
  onPrimaryMuted: "rgba(255,255,255,0.85)",
  backdrop: "rgba(15,23,42,0.45)",
  avatarBg: "#e2e8f0",
  avatarText: "#475569",
} as const;

/** Badge colors per student status (mirrors `.badge-*` in the web CSS). */
export const statusPalette: Record<StudentStatus, { bg: string; fg: string }> = {
  active: { bg: colors.successBg, fg: colors.success },
  graduated: { bg: colors.infoBg, fg: colors.info },
  suspended: { bg: colors.dangerBg, fg: colors.danger },
  withdrawn: { bg: colors.neutralBg, fg: colors.neutralText },
};

export const radius = { sm: 6, md: 8, lg: 12, pill: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  title: 22,
  stat: 24,
} as const;
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/** Card shadow. Android uses elevation, iOS/web use the shadow props. */
export const shadow: ViewStyle = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
}) as ViewStyle;
