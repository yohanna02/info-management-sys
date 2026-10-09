import { router, Stack, useLocalSearchParams } from "expo-router";
import { HeaderButton } from "@/components/header-button";
import { colors, fontSize, fontWeight } from "@/theme";
import { isValidStudentId } from "@/utils/student";

export default function StudentLayout() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const valid = isValidStudentId(id);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Student",
          headerRight: valid
            ? () => (
                <HeaderButton
                  label="Edit"
                  onPress={() => router.navigate(`/student/${id}/edit`)}
                />
              )
            : undefined,
        }}
      />
      <Stack.Screen name="edit" options={{ title: "Edit student" }} />
    </Stack>
  );
}
