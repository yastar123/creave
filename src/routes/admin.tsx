import { createFileRoute } from "@tanstack/react-router";

import { AdminPage } from "@/components/auth-page";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});
