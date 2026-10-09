import { useAuthActions } from "@convex-dev/auth/react";
import type { ReactNode } from "react";

interface LayoutProps {
  onNavigate: (path: "dashboard" | "students") => void;
  current: "dashboard" | "students";
  children: ReactNode;
}

export function Layout({ onNavigate, current, children }: LayoutProps) {
  const { signOut } = useAuthActions();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-title">
          <strong>CE Department — Student Records</strong>
          <span>Computer Engineering · Admin Console</span>
        </div>
        <nav className="topbar-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onNavigate("dashboard")}
            style={
              current === "dashboard"
                ? { background: "rgba(255,255,255,0.18)", color: "white" }
                : undefined
            }
          >
            Dashboard
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onNavigate("students")}
            style={
              current === "students"
                ? { background: "rgba(255,255,255,0.18)", color: "white" }
                : undefined
            }
          >
            Students
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              void signOut();
            }}
          >
            Sign out
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
