import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Button } from "@/components/button";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {required ? " *" : ""}
    </Text>
  );
}

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  value,
  onChangeText,
  required,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  secureTextEntry,
  multiline,
  editable = true,
  style,
}: TextFieldProps) {
  return (
    <View style={style}>
      <FieldLabel label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect ?? false}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        editable={editable}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          !editable ? styles.editableDisabled : null,
        ]}
      />
    </View>
  );
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  required?: boolean;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

/** Dropdown that opens a modal list. React Native has no native `<select>`. */
export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Select…",
  style,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={style}>
      <FieldLabel label={label} required={required} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        onPress={() => setOpen(true)}
        style={styles.control}
      >
        <Text
          numberOfLines={1}
          style={selected ? styles.controlValue : styles.controlPlaceholder}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {open ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <ScrollView bounces={false} style={styles.sheetList}>
                {options.map((option) => (
                  <Pressable
                    key={option.value || "__all__"}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      pressed ? styles.optionPressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        option.value === value ? styles.optionLabelSelected : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.value === value ? (
                      <Text style={styles.check}>✓</Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
              <Button
                label="Cancel"
                variant="secondary"
                size="sm"
                onPress={() => setOpen(false)}
                style={styles.sheetCancel}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

export interface DateFieldProps {
  label: string;
  /** ISO date in `YYYY-MM-DD` form, or an empty string. */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maximumDate?: Date;
  style?: StyleProp<ViewStyle>;
}

export function DateField({
  label,
  value,
  onChange,
  required,
  maximumDate,
  style,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseIsoDate(value);

  const picker = (
    <DateTimePicker
      value={parsed ?? maximumDate ?? new Date()}
      mode="date"
      display={Platform.OS === "ios" ? "inline" : "default"}
      maximumDate={maximumDate}
      onChange={(event: DateTimePickerEvent, selected?: Date) => {
        if (Platform.OS === "android") setOpen(false);
        if (event.type === "dismissed" || !selected) return;
        onChange(toIsoDate(selected));
      }}
    />
  );

  return (
    <View style={style}>
      <FieldLabel label={label} required={required} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: parsed ? formatDisplayDate(parsed) : "Not set" }}
        onPress={() => setOpen(true)}
        style={styles.control}
      >
        <Text
          numberOfLines={1}
          style={parsed ? styles.controlValue : styles.controlPlaceholder}
        >
          {parsed ? formatDisplayDate(parsed) : "YYYY-MM-DD"}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {open ? (
        Platform.OS === "ios" ? (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setOpen(false)}
          >
            <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
              <Pressable style={styles.dateSheet} onPress={() => {}}>
                {picker}
                <Button
                  label="Done"
                  size="sm"
                  onPress={() => setOpen(false)}
                  style={styles.sheetCancel}
                />
              </Pressable>
            </Pressable>
          </Modal>
        ) : (
          // Android renders the picker in its own dialog window, which a
          // React Native Modal would sit on top of and hide.
          <View style={styles.androidPicker}>{picker}</View>
        )
      ) : null}
    </View>
  );
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.base,
    paddingVertical: 9,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  editableDisabled: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textMuted,
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  controlValue: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
  },
  controlPlaceholder: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  sheetList: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionLabel: {
    fontSize: fontSize.lg,
    color: colors.text,
    textTransform: "capitalize",
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  check: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  sheetCancel: {
    marginTop: spacing.sm,
  },
  dateSheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  androidPicker: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
});
