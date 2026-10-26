import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import { siteContentSchema } from "./lib/site-content-shared";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

const contentElement = document.getElementById("crevora-site-content");
if (!contentElement?.textContent) {
  throw new Error("The initial site content could not be loaded from PostgreSQL.");
}

const siteContent = siteContentSchema.parse(JSON.parse(contentElement.textContent));
const router = getRouter(siteContent);

void router.load().then(
  () => {
    hydrateRoot(
      rootElement,
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  },
  (error: unknown) => {
    console.error("The application could not load its initial route.", error);
    createRoot(rootElement).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  },
);
