import { useQuery } from "convex/react";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "@convex/_generated/api";
import { SectionCard } from "@/components/section-card";
import { StudentRow } from "@/components/student-row";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";
import { STUDENT_LEVELS, STUDENT_STATUSES } from "@/utils/student";

export function DashboardScreen() {
  const counts = useQuery(api.students.counts);
  const totals = useQuery(api.students.list, {
    paginationOpts: { numItems: 5, cursor: null },
  });

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>
        Overview of student records in Computer Engineering department.
      </Text>

      <View style={styles.tiles}>
        <StatTile label="Total students" value={counts === undefined ? undefined : counts.total} />
        {STUDENT_LEVELS.map((level) => (
          <StatTile
            key={level}
            label={`Level ${level}`}
            value={counts === undefined ? undefined : (counts.byLevel[level] ?? 0)}
          />
        ))}
      </View>

      <SectionCard title="Status breakdown">
        {counts === undefined ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : (
          <View style={styles.tiles}>
            {STUDENT_STATUSES.map((status) => (
              <StatTile
                key={status}
                label={status}
                value={counts.byStatus[status] ?? 0}
                tileStyle={styles.statusTile}
              />
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Recent students"
        action={
          <Text
            accessibilityRole="link"
            onPress={() => router.navigate("/students")}
            style={styles.link}
          >
            View all
          </Text>
        }
      >
        {totals === undefined ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : totals.page.length === 0 ? (
          <Text style={styles.muted}>No student records yet. Add the first student to get started.</Text>
        ) : (
          <View style={styles.list}>
            {totals.page.map((student) => (
              <StudentRow
                key={student._id}
                student={student}
                onPress={() => router.navigate(`/student/${student._id}`)}
              />
            ))}
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
}

function StatTile({
  label,
  value,
  tileStyle,
}: {
  label: string;
  value: number | undefined;
  tileStyle?: object;
}) {
  return (
    <View style={[styles.tile, tileStyle]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value === undefined ? "…" : value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  tile: {
    width: "50%",
    padding: spacing.xs,
  },
  statusTile: {
    width: "50%",
  },
  tileLabel: {
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
  },
  tileValue: {
    fontSize: fontSize.stat,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    overflow: "hidden",
  },
  muted: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  link: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  list: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.xs,
  },
});
