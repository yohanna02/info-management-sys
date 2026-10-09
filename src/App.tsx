import { useConvexAuth } from "convex/react";
import { type ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { StudentsList } from "@/pages/StudentsList";
import { StudentForm } from "@/pages/StudentForm";
import { StudentDetail } from "@/pages/StudentDetail";
import { NotFound } from "@/components/NotFound";
import { useHashRouter } from "@/lib/router";
import type { Id } from "../convex/_generated/dataModel";

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useHashRouter();

  if (isLoading) {
    return <div className="loader-page">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  function goToTop(name: "dashboard" | "students") {
    if (name === "dashboard") {
      router.navigate({ name: "dashboard" });
    } else {
      router.navigate({ name: "students" });
    }
  }

  const current = router.route.name === "dashboard" ? "dashboard" : "students";

  let content: ReactNode;
  switch (router.route.name) {
    case "dashboard":
      content = (
        <Dashboard
          onView={() => router.navigate({ name: "students" })}
          onAddStudent={() => router.navigate({ name: "newStudent" })}
        />
      );
      break;
    case "students":
      content = (
        <StudentsList
          onAdd={() => router.navigate({ name: "newStudent" })}
          onEdit={(id) => router.navigate({ name: "editStudent", id })}
          onView={(id) => router.navigate({ name: "viewStudent", id })}
        />
      );
      break;
    case "newStudent":
      content = (
        <StudentForm
          onDone={() => router.navigate({ name: "students" })}
          onCancel={() => router.navigate({ name: "students" })}
        />
      );
      break;
    case "editStudent": {
      const id = router.route.id as Id<"students">;
      content = (
        <StudentForm
          id={id}
          onDone={() => router.navigate({ name: "viewStudent", id })}
          onCancel={() => router.navigate({ name: "viewStudent", id })}
        />
      );
      break;
    }
    case "viewStudent": {
      const id = router.route.id as Id<"students">;
      content = (
        <StudentDetail
          id={id}
          onEdit={() => router.navigate({ name: "editStudent", id })}
          onBack={() => router.navigate({ name: "students" })}
        />
      );
      break;
    }
    default:
      content = <NotFound />;
  }

  return (
    <Layout
      current={current}
      onNavigate={(name) => goToTop(name)}
    >
      {content}
    </Layout>
  );
}

export default App;
