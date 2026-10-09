import { usePaginatedQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/button";
import { SelectField } from "@/components/field";
import { LoadingView } from "@/components/loading-view";
import { StudentRow } from "@/components/student-row";
import { colors, fontSize, fontWeight, radius, spacing } from "@/theme";
import {
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  type StudentLevel,
  type StudentStatus,
} from "@/utils/student";

export function StudentsListScreen() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<StudentLevel | "">("");
  const [status, setStatus] = useState<StudentStatus | "">("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const args = {
    level: level || undefined,
    status: status || undefined,
    search: search || undefined,
  };

  const { results, status: queryStatus, loadMore } = usePaginatedQuery(
    api.students.list,
    args,
    { initialNumItems: 10 },
  );

  const activeFilterCount = (level ? 1 : 0) + (status ? 1 : 0);
  const loadingFirstPage = queryStatus === "LoadingFirstPage";

  function reset() {
    setSearchInput("");
    setSearch("");
    setLevel("");
    setStatus("");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search by name, matric, email, program…"
          placeholderTextColor={colors.textMuted}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search students"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filters"
          onPress={() => setFiltersOpen(true)}
          style={({ pressed }) => [styles.filterButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.filterLabel}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            onPress={() => router.navigate(`/student/${item._id}`)}
          />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          loadingFirstPage ? (
            <LoadingView label="Loading students…" />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No students match the current filters.
              </Text>
              <Button label="Reset filters" variant="secondary" onPress={reset} />
            </View>
          )
        }
        ListFooterComponent={
          queryStatus === "LoadingMore" ? (
            <LoadingView label="Loading more…" inline />
          ) : queryStatus === "CanLoadMore" ? (
            <View style={styles.loadMore}>
              <Button
                label="Load more"
                variant="secondary"
                onPress={() => loadMore(20)}
              />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (queryStatus === "CanLoadMore") loadMore(20);
        }}
        onEndReachedThreshold={0.5}
      />

      {filtersOpen ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setFiltersOpen(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setFiltersOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <SelectField
                label="Level"
                value={level}
                onChange={setLevel}
                options={[
                  { value: "", label: "All" },
                  ...STUDENT_LEVELS.map((value) => ({ value, label: value })),
                ]}
                style={styles.sheetField}
              />
              <SelectField
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "", label: "All" },
                  ...STUDENT_STATUSES.map((value) => ({ value, label: value })),
                ]}
                style={styles.sheetField}
              />
              <View style={styles.sheetActions}>
                <Button
                  label="Reset"
                  variant="secondary"
                  onPress={reset}
                  style={styles.flex1}
                />
                <Button
                  label="Done"
                  onPress={() => setFiltersOpen(false)}
                  style={styles.flex1}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  search: {
    flex: 1,
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
  filterButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  filterLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  list: {
    flexGrow: 1,
    backgroundColor: colors.surface,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: "center",
  },
  loadMore: {
    padding: spacing.lg,
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
  },
  sheetTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  sheetField: {
    marginBottom: spacing.md,
  },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
});
