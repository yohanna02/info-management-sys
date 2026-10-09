import { router, useLocalSearchParams } from "expo-router";
import { MissingStudentScreen } from "@/screens/student-detail";
import { StudentFormScreen } from "@/screens/student-form";
import { isValidStudentId } from "@/utils/student";

export default function EditStudentRoute() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!isValidStudentId(id)) {
    return <MissingStudentScreen onBack={() => router.replace("/students")} />;
  }

  function goBack() {
    if (router.canGoBack()) router.back();
  }

  return <StudentFormScreen id={id} onDone={goBack} onCancel={goBack} />;
}
