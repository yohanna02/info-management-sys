import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { StatusBadge } from "@/components/badge";
import { Button } from "@/components/button";
import { DetailGrid, type DetailItem } from "@/components/detail-grid";
import { LoadingView } from "@/components/loading-view";
import { Notice } from "@/components/notice";
import { SectionCard } from "@/components/section-card";
import { StudentPhoto } from "@/components/student-photo";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { fullName } from "@/utils/student";

export interface StudentDetailScreenProps {
  id: Id<"students">;
  onEdit: () => void;
  onDeleted: () => void;
  onBack?: () => void;
}

export function StudentDetailScreen({
  id,
  onEdit,
  onDeleted,
  onBack,
}: StudentDetailScreenProps) {
  const student = useQuery(api.students.getById, { id });
  const remove = useMutation(api.students.remove);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await remove({ id });
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete student.");
      setDeleting(false);
    }
  }

  function confirmDelete() {
    const name = student ? fullName(student) : "this student";
    const matric = student ? ` (${student.matricNumber})` : "";
    Alert.alert(
      "Delete student",
      `Delete ${name}${matric}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void handleDelete(),
        },
      ],
    );
  }

  if (student === undefined) {
    return <LoadingView label="Loading student…" />;
  }
  if (student === null) {
    return <MissingStudentScreen onBack={onBack} />;
  }

  const name = fullName(student);

  const personal: DetailItem[] = [
    { label: "First name", value: student.firstName },
    { label: "Last name", value: student.lastName },
    { label: "Middle name", value: student.middleName },
    { label: "Gender", value: student.gender },
    { label: "Date of birth", value: formatDate(student.dateOfBirth) },
    { label: "State of origin", value: student.stateOfOrigin },
  ];

  const contact: DetailItem[] = [
    { label: "Email", value: student.email },
    { label: "Phone", value: student.phone },
    { label: "Address", value: student.address, full: true },
  ];

  const academic: DetailItem[] = [
    { label: "Level", value: student.level },
    { label: "Entry year", value: student.entryYear },
    { label: "Graduation year", value: student.graduationYear },
    { label: "Program", value: student.program, full: true },
  ];

  const guardian: DetailItem[] = [
    { label: "Name", value: student.guardianName },
    { label: "Relationship", value: student.guardianRelationship },
    { label: "Phone", value: student.guardianPhone },
    { label: "Email", value: student.guardianEmail },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {error ? <Notice>{error}</Notice> : null}

      <SectionCard>
        <View style={styles.header}>
          <StudentPhoto url={student.photoUrl} name={name} size="lg" />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.matric}>Matric {student.matricNumber}</Text>
            <StatusBadge status={student.status} />
          </View>
        </View>
        <View style={styles.actions}>
          <Button label="Edit" onPress={onEdit} style={styles.flex1} />
          <Button
            label="Delete"
            variant="danger"
            loading={deleting}
            onPress={confirmDelete}
            style={styles.flex1}
          />
        </View>
      </SectionCard>

      <SectionCard title="Personal">
        <DetailGrid items={personal} />
      </SectionCard>

      <SectionCard title="Contact">
        <DetailGrid items={contact} />
      </SectionCard>

      <SectionCard title="Academic">
        <DetailGrid items={academic} />
      </SectionCard>

      <SectionCard title="Guardian / Next of kin">
        <DetailGrid items={guardian} />
      </SectionCard>

      {student.notes ? (
        <SectionCard title="Notes">
          <Text style={styles.notes}>{student.notes}</Text>
        </SectionCard>
      ) : null}

      <Text style={styles.muted}>
        Record created on {new Date(student._creationTime).toLocaleString()}
      </Text>
    </ScrollView>
  );
}

export function MissingStudentScreen({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.missing}>
      <SectionCard>
        <Text style={styles.missingTitle}>Student not found</Text>
        <Text style={styles.muted}>
          The student you are looking for has been removed or never existed.
        </Text>
        {onBack ? (
          <Button label="Back to list" variant="secondary" onPress={onBack} />
        ) : null}
      </SectionCard>
    </View>
  );
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  headerInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  matric: {
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  flex1: {
    flex: 1,
  },
  notes: {
    fontSize: fontSize.base,
    color: colors.text,
  },
  muted: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  missing: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  missingTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
