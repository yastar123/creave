import { createFileRoute, Link } from "@tanstack/react-router";

import { StudioShell } from "@/components/studio-shell";
import { usePublicCmsPage } from "@/lib/cms-client";

export const Route = createFileRoute("/pages_/$slug")({
  component: CustomCmsPage,
  head: () => ({
    meta: [
      { title: "CREVORA — Custom page" },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => (
    <StudioShell>
      <section className="inner-hero">
        <span className="eyebrow">CREVORA</span>
        <h1>Page not found.</h1>
        <Link className="button button-studio" to="/">Back to home</Link>
      </section>
    </StudioShell>
  ),
});

function CustomCmsPage() {
  const { slug } = Route.useParams();
  const pageQuery = usePublicCmsPage(`custom-route-${slug}`);

  if (pageQuery.isLoading) {
    return (
      <StudioShell>
        <section className="inner-hero" aria-live="polite">
          <span className="eyebrow">CREVORA</span>
          <h1>Loading page…</h1>
        </section>
      </StudioShell>
    );
  }

  if (pageQuery.isError || !pageQuery.data?.page.isCustom) {
    return (
      <StudioShell>
        <section className="inner-hero">
          <span className="eyebrow">CREVORA</span>
          <h1>Page not found.</h1>
          <Link className="button button-studio" to="/">Back to home</Link>
        </section>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <section className="inner-hero">
        <span className="eyebrow">CREVORA / PAGE</span>
        <h1>{pageQuery.data.page.title}</h1>
      </section>
    </StudioShell>
  );
}
