import { router } from "expo-router";
import { StudentFormScreen } from "@/screens/student-form";

export default function NewStudentRoute() {
  return (
    <StudentFormScreen
      onDone={() => router.replace("/students")}
      onCancel={() => (router.canGoBack() ? router.back() : router.replace("/students"))}
    />
  );
}
