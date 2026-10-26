import { createContext, useContext, type ReactNode } from "react";

import type { SiteContent } from "./site-content-shared";

const SiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const content = useContext(SiteContentContext);
  if (!content) {
    throw new Error("Site content must be loaded from PostgreSQL before rendering the page.");
  }
  return content;
}
