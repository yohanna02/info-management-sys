import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "@/components/badge";
import { StudentPhoto } from "@/components/student-photo";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { fullName, type Student } from "@/utils/student";

export interface StudentRowProps {
  student: Student;
  onPress: () => void;
}

/** Tappable list row showing photo, name, email, matric, level, and status. */
export function StudentRow({ student, onPress }: StudentRowProps) {
  const name = fullName(student);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <StudentPhoto url={student.photoUrl} name={name} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {student.email}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {student.matricNumber} · {student.level} · {student.program}
        </Text>
      </View>
      <StatusBadge status={student.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
