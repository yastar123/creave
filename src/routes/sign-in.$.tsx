import { createFileRoute } from "@tanstack/react-router";

import { SignInPage } from "@/components/auth-page";

export const Route = createFileRoute("/sign-in/$")({
  component: SignInPage,
});
