import { Navigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { CmsDashboard } from "@/components/cms-admin";

type SessionState = "loading" | "signed-in" | "signed-out";

export function SignInPage() {
  const [session, setSession] = useState<SessionState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { authenticated?: boolean };
        if (!cancelled) setSession(result.authenticated ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (!cancelled) setSession("signed-out");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      window.location.assign("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in. Try again.");
      setSubmitting(false);
    }
  }

  if (session === "loading") {
    return (
      <div className="auth-screen">
        <span className="auth-loading">Checking sign-in…</span>
      </div>
    );
  }
  if (session === "signed-in") return <Navigate to="/admin" />;

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-eyebrow">CREVORA / ADMIN</span>
        <h1>Sign in to your studio.</h1>
        <p>Use your administrator email and password to manage the CREVORA website.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email address
            <input
              autoComplete="username"
              autoFocus
              maxLength={255}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button className="auth-submit" disabled={submitting} type="submit">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [session, setSession] = useState<SessionState>("loading");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { authenticated?: boolean };
        if (!cancelled) setSession(result.authenticated ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (!cancelled) setSession("signed-out");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (session === "loading") {
    return (
      <div className="auth-screen">
        <span className="auth-loading">Checking your access…</span>
      </div>
    );
  }
  if (session === "signed-out") return <Navigate to="/login" />;
  return (
    <CmsDashboard
      onLogout={async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
        } finally {
          window.location.assign("/login");
        }
      }}
    />
  );
}
