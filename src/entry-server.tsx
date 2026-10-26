import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import { defaultSiteContent } from "./lib/studio-content";
import type { SiteContent } from "./lib/site-content-shared";

export { defaultSiteContent };

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

export type RenderedPage = {
  markup: string;
  siteContent: SiteContent;
  head: {
    meta: RouteMetaEntry[];
    scripts: RouteScriptEntry[];
  };
};

export async function renderPage(url: string, siteContent: SiteContent): Promise<RenderedPage> {
  const router = getRouter(siteContent, url);
  await router.load();

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

  return {
    markup: renderToString(createElement(RouterProvider, { router })),
    siteContent,
    head: {
      meta: routeHead?.meta ?? [],
      scripts: routeHead?.scripts ?? [],
    },
  };
}
