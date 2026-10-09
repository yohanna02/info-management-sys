import { router, useLocalSearchParams } from "expo-router";
import { MissingStudentScreen, StudentDetailScreen } from "@/screens/student-detail";
import { isValidStudentId } from "@/utils/student";

export default function StudentRoute() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!isValidStudentId(id)) {
    return <MissingStudentScreen onBack={() => router.replace("/students")} />;
  }

  return (
    <StudentDetailScreen
      id={id}
      onEdit={() => router.navigate(`/student/${id}/edit`)}
      onDeleted={() => router.replace("/students")}
      onBack={() => router.replace("/students")}
    />
  );
}
