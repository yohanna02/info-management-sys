import { useAuthActions } from "@convex-dev/auth/react";
import { useState, type FormEvent } from "react";

type Mode = "signIn" | "signUp";

export function LoginPage() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("email", email.trim());
      formData.set("password", password);
      if (mode === "signUp") {
        formData.set("name", name.trim());
        formData.set("flow", "signUp");
      } else {
        formData.set("flow", "signIn");
      }
      await signIn("password", formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "signIn"
            ? "Could not sign in."
            : "Could not create account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>CE Department</h1>
        <p className="subtitle">
          Computer Engineering — Student Records
          {mode === "signIn" ? " · Admin sign in" : " · Create admin account"}
        </p>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === "signIn" ? "active" : ""}`}
            onClick={() => setMode("signIn")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`login-tab ${mode === "signUp" ? "active" : ""}`}
            onClick={() => setMode("signUp")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signUp" && (
            <div>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin full name"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              minLength={8}
              required
            />
          </div>

          {error && <div className="notice notice-error">{error}</div>}

          <button
            type="submit"
            className="btn"
            style={{ width: "100%" }}
            disabled={submitting}
          >
            {submitting && <span className="spinner" />}
            {mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
          {mode === "signIn"
            ? "Only admins can sign in to view and edit student records."
            : "First admin account creates the department administrator."}
        </p>
      </div>
    </div>
  );
}
