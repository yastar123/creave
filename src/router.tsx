import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { SiteContent } from "./lib/site-content-shared";

export const getRouter = (siteContent: SiteContent, initialUrl?: string) => {
  const queryClient = new QueryClient();
  const history = initialUrl
    ? createMemoryHistory({ initialEntries: [initialUrl] })
    : undefined;

  const router = createRouter({
    routeTree,
    context: { queryClient, siteContent },
    ...(history ? { history } : {}),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // This app uses a custom SSR entry point, so it does not install the router's
  // generated hydration manifest. Keep RouterProvider in SSR mode on the client
  // so it renders the same match tree instead of adding a client-only Suspense
  // boundary during hydration.
  router.ssr = { manifest: undefined };

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
