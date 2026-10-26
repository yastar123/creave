import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { renderPage } from "@/entry-server";
import { defaultSiteContent } from "@/lib/studio-content";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient(), siteContent: defaultSiteContent } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the administrator login route at /login", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient(), siteContent: defaultSiteContent } });

    const matches = router.matchRoutes("/login");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("server-renders direct routes with their page metadata", async () => {
    const page = await renderPage("/contact", defaultSiteContent);

    expect(page.markup).toContain("Let’s talk about");
    expect(page.head.meta).toContainEqual({
      title: "Let’s Talk About Your Brand — CREVORA",
    });
  });
});
