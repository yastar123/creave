import { createFileRoute } from "@tanstack/react-router";

import { SignUpPage } from "@/components/auth-page";

export const Route = createFileRoute("/sign-up/$")({
  component: SignUpPage,
});
