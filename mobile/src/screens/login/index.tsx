import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/button";
import { TextField } from "@/components/field";
import { Notice } from "@/components/notice";
import { APP_NAME, APP_TITLE } from "@/constants";
import { colors, fontSize, fontWeight, radius, shadow, spacing } from "@/theme";

type Mode = "signIn" | "signUp";

export function LoginScreen() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signUp" && !trimmedName) {
      setError("Full name is required.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("email", trimmedEmail);
      formData.set("password", password);
      if (mode === "signUp") {
        formData.set("name", trimmedName);
        formData.set("flow", "signUp");
      } else {
        formData.set("flow", "signIn");
      }
      await signIn("password", formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "signIn"
            ? "Could not sign in."
            : "Could not create account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>
            Computer Engineering — Student Records ·{" "}
            {mode === "signIn" ? "Admin sign in" : "Create admin account"}
          </Text>

          <View style={styles.tabs}>
            <TabButton
              label="Sign in"
              active={mode === "signIn"}
              onPress={() => setMode("signIn")}
            />
            <TabButton
              label="Create account"
              active={mode === "signUp"}
              onPress={() => setMode("signUp")}
            />
          </View>

          {mode === "signUp" ? (
            <TextField
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Admin full name"
              autoComplete="name"
              style={styles.field}
            />
          ) : null}

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="admin@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.field}
          />

          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            style={styles.field}
          />

          {error ? <Notice>{error}</Notice> : null}

          <Button
            label={mode === "signIn" ? "Sign in" : "Create account"}
            loading={submitting}
            onPress={() => void handleSubmit()}
          />

          <Text style={styles.hint}>
            {mode === "signIn"
              ? "Only admins can sign in to view and edit student records."
              : "First admin account creates the department administrator."}
          </Text>
        </View>
        <Text style={styles.footer}>{APP_TITLE}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active ? styles.tabActive : null]}
    >
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadow,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadow,
  },
  tabLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  field: {
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
  },
  footer: {
    fontSize: fontSize.sm,
    color: colors.onPrimaryMuted,
    textAlign: "center",
  },
});
