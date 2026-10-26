import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteContentProvider } from "../lib/site-content-context";
import type { SiteContent } from "../lib/site-content-shared";

function NotFoundComponent() {
  return (
    <main className="status-page">
      <span className="eyebrow">Error 404</span>
      <h1>This page took a different direction.</h1>
      <p>The page you’re looking for doesn’t exist or has moved. Here are a few good places to start instead.</p>
      <nav className="status-links" aria-label="Helpful links">
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/social-media-management-namibia">Social Media Marketing</Link>
        <Link to="/journal">Journal</Link>
        <Link to="/about">About</Link>
      </nav>
      <Link to="/contact" className="status-cta">Start a conversation</Link>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  siteContent: SiteContent;
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient, siteContent } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteContentProvider content={siteContent}>
        <RouteMetadata />
        <Outlet />
      </SiteContentProvider>
    </QueryClientProvider>
  );
}

type RouteMetaEntry = {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
};

type RouteScriptEntry = {
  type?: string;
  children?: string;
};

function RouteMetadata() {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const currentMatch = router.state.matches.at(-1);
    const route = (currentMatch
      ? router.routesById[currentMatch.routeId]
      : undefined) as unknown as {
      options?: {
        head?: (context: { loaderData: unknown }) => {
          meta?: RouteMetaEntry[];
          scripts?: RouteScriptEntry[];
        };
      };
    };
    const routeHead = route.options?.head?.({ loaderData: currentMatch?.loaderData });
    const meta = routeHead?.meta ?? [];
    const scripts = routeHead?.scripts ?? [];

    document.head.querySelectorAll("[data-route-meta]").forEach((element) => element.remove());

    for (const entry of meta) {
      if (entry.title) {
        document.title = entry.title;
      }

      if ((!entry.name && !entry.property) || !entry.content) {
        continue;
      }

      const element = document.createElement("meta");
      if (entry.name) element.setAttribute("name", entry.name);
      if (entry.property) element.setAttribute("property", entry.property);
      element.setAttribute("content", entry.content);
      element.dataset["routeMeta"] = "true";
      document.head.append(element);
    }

    for (const entry of scripts) {
      const element = document.createElement("script");
      if (entry.type) element.type = entry.type;
      element.textContent = entry.children ?? "";
      element.dataset["routeMeta"] = "true";
      document.head.append(element);
    }
  }, [pathname, router]);

  return null;
}
