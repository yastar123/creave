import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";

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
  head: {
    meta: RouteMetaEntry[];
    scripts: RouteScriptEntry[];
  };
};

export async function renderPage(url: string): Promise<RenderedPage> {
  const router = getRouter(url);
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
    head: {
      meta: routeHead?.meta ?? [],
      scripts: routeHead?.scripts ?? [],
    },
  };
}
