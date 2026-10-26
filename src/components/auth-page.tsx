import { SignIn, SignUp, useAuth } from "@clerk/react";
import { Navigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { CmsDashboard } from "@/components/cms-admin";
import { getClerkAppearance } from "@/components/auth-provider";

function ClientReady({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return <div className="auth-screen"><span className="auth-loading">Loading secure sign-in…</span></div>;
  }
  return <>{children}</>;
}

export function SignInPage() {
  return (
    <ClientReady>
      <SignInContent />
    </ClientReady>
  );
}

function SignInContent() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-eyebrow">CREVORA / ADMIN</span>
        <h1>Sign in to your studio.</h1>
        <p>Manage the content and shared details on your CREVORA website.</p>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/admin"
          forceRedirectUrl="/admin"
          appearance={getClerkAppearance(window.location.origin)}
        />
      </div>
    </div>
  );
}

export function SignUpPage() {
  return (
    <ClientReady>
      <SignUpContent />
    </ClientReady>
  );
}

function SignUpContent() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-eyebrow">CREVORA / ADMIN</span>
        <h1>Create an account.</h1>
        <p>Only an authorized, verified account can access the content manager.</p>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/admin"
          forceRedirectUrl="/admin"
          appearance={getClerkAppearance(window.location.origin)}
        />
      </div>
    </div>
  );
}

function AdminAccess() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="auth-screen"><span className="auth-loading">Checking your access…</span></div>;
  }
  if (!isSignedIn) return <Navigate to="/sign-in" />;
  return <CmsDashboard />;
}

export function AdminPage() {
  return (
    <ClientReady>
      <AdminAccess />
    </ClientReady>
  );
}
