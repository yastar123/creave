import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { AuthProvider } from "./components/auth-provider";
import { getRouter } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

const router = getRouter();

void router.load().then(
  () => {
    hydrateRoot(
      rootElement,
      <StrictMode>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </StrictMode>,
    );
  },
  (error: unknown) => {
    console.error("The application could not load its initial route.", error);
    createRoot(rootElement).render(
      <StrictMode>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </StrictMode>,
    );
  },
);
