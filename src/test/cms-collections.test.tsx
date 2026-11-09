import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CmsCollections } from "@/components/cms-admin/collections";
import { defaultSiteContent } from "@/lib/studio-content";
import { siteContentCollectionSchemas, type SiteContent } from "@/lib/site-content-shared";

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response);
}

function cloneContent() {
  return JSON.parse(JSON.stringify(defaultSiteContent)) as SiteContent;
}

function setupCollections() {
  let content = cloneContent();
  const writes: Array<{ key: string; items: unknown[] }> = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/api/cms/admin/collections" && !init?.method) {
      return jsonResponse({ content });
    }
    if (init?.method === "PUT" && url.pathname.startsWith("/api/cms/admin/collections/")) {
      const key = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
      const body = JSON.parse(String(init.body ?? "{}")) as { items?: unknown };
      const schema = siteContentCollectionSchemas[key as keyof SiteContent];
      if (!schema) return jsonResponse({ error: "Content collection not found." }, 404);
      const parsed = schema.safeParse(body.items);
      if (!parsed.success) {
        return jsonResponse({ error: "One or more records do not match this collection." }, 400);
      }
      const items = parsed.data as unknown[];
      writes.push({ key, items });
      content = { ...content, [key]: items } as SiteContent;
      return jsonResponse({ ok: true, collectionKey: key, items });
    }
    return jsonResponse({ error: `Unexpected test request: ${url.pathname}` }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <CmsCollections />
    </QueryClientProvider>,
  );
  return { fetchMock, writes, getContent: () => content };
}

describe("CMS PostgreSQL content collections", () => {
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("creates, updates, and deletes a service record through the admin API", async () => {
    const { writes, getContent } = setupCollections();
    expect(await screen.findByRole("heading", { name: "Content collections" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "New service" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "To" }), {
      target: { value: "/new-service" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Menu Note" }), {
      target: { value: "A new admin-managed service" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Short" }), {
      target: { value: "New service" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Description" }), {
      target: { value: "Description of this new service." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Detail" }), {
      target: { value: "More detail about the service." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await screen.findByText("Saved to PostgreSQL");
    expect(writes.at(-1)?.key).toBe("services");
    expect(getContent().services.at(-1)?.to).toBe("/new-service");

    fireEvent.click(screen.getByRole("button", { name: /new-service/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Menu Note" }), {
      target: { value: "Updated service menu note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await screen.findByText("Saved to PostgreSQL");
    expect(getContent().services.at(-1)?.menuNote).toBe("Updated service menu note");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await screen.findByText("Record deleted");
    await waitFor(() => expect(getContent().services.some((service) => service.to === "/new-service")).toBe(false));
    expect(writes.at(-1)?.items).toHaveLength(defaultSiteContent.services.length);
  });

  it("shows a validation error instead of saving malformed article data", async () => {
    setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.change(screen.getByRole("combobox", { name: "Content collection" }), {
      target: { value: "articles" },
    });
    fireEvent.click(screen.getByRole("button", { name: "New article" }));
    expect(await screen.findByRole("textbox", { name: "Image" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Video" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Image Alt" })).toBeInTheDocument();
    fireEvent.change(await screen.findByRole("textbox", { name: "Date" }), {
      target: { value: "not-a-date" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "One or more records do not match this collection.",
    );
  });

  it("provides image and video upload fields for each project gallery item", async () => {
    setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.change(screen.getByRole("combobox", { name: "Content collection" }), {
      target: { value: "projects" },
    });

    expect(await screen.findByLabelText("Gallery item 1 image")).toBeInTheDocument();
    expect(screen.getByLabelText("Gallery item 1 video")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add gallery item" })).toBeInTheDocument();
  });

  it("edits service package prices and inclusions with structured fields", async () => {
    const { getContent } = setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.click(screen.getByRole("button", { name: /web-solutions-namibia/ }));

    expect(await screen.findByRole("textbox", { name: "Package 1 name" })).toHaveValue("Silver Website");
    fireEvent.change(screen.getByRole("textbox", { name: "Package 1 price" }), {
      target: { value: "N$ 1 000" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Package 1 features" }), {
      target: { value: "Responsive design\nCMS training" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));

    await screen.findByText("Saved to PostgreSQL");
    const savedPackages = getContent().services.find((service) => service.to === "/web-solutions-namibia")?.packages;
    expect(savedPackages?.[0]).toMatchObject({
      name: "Silver Website",
      price: "N$ 1 000",
      features: ["Responsive design", "CMS training"],
    });
  });

  it("creates an article with a cover and body content", async () => {
    const { getContent } = setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.change(screen.getByRole("combobox", { name: "Content collection" }), {
      target: { value: "articles" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "New article" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Slug" }), {
      target: { value: "a-new-journal-entry" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Category" }), {
      target: { value: "Studio news" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "A new journal entry" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Excerpt" }), {
      target: { value: "A short introduction to this article." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Date" }), {
      target: { value: "2026-11-10" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Author" }), {
      target: { value: "CREVORA Studio" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Body" }), {
      target: { value: "First paragraph.\nSecond paragraph." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Related" }), {
      target: { value: JSON.stringify({ label: "Services", to: "/services" }) },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Image" }), {
      target: { value: "/uploads/journal-cover.jpg" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Image Alt" }), {
      target: { value: "Journal cover" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));

    await screen.findByText("Saved to PostgreSQL");
    expect(getContent().articles.at(-1)).toMatchObject({
      slug: "a-new-journal-entry",
      image: "/uploads/journal-cover.jpg",
      body: ["First paragraph.", "Second paragraph."],
    });
  });

  it("creates a Trusted by client with an editable logo and name", async () => {
    const { getContent } = setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.change(screen.getByRole("combobox", { name: "Content collection" }), {
      target: { value: "trustedBy" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Add client" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "New client" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Logo" }), {
      target: { value: "/uploads/client-logo.svg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));

    await screen.findByText("Saved to PostgreSQL");
    expect(getContent().trustedBy.at(-1)).toMatchObject({
      name: "New client",
      logo: "/uploads/client-logo.svg",
    });
  });

  it("adds a social profile to the collection used by the site footer", async () => {
    const { getContent } = setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.change(screen.getByRole("combobox", { name: "Content collection" }), {
      target: { value: "socials" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Add profile" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Instagram" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Url" }), {
      target: { value: "https://instagram.com/crevora" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));

    await screen.findByText("Saved to PostgreSQL");
    expect(getContent().socials.at(-1)).toEqual({
      name: "Instagram",
      url: "https://instagram.com/crevora",
    });
  });

  it("provides an editable social package with a safe price-on-request default", async () => {
    setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.click(screen.getByRole("button", { name: /social-media-management-namibia/ }));

    expect(await screen.findByRole("textbox", { name: "Package 1 name" })).toHaveValue("Social Media 360°");
    expect(screen.getByRole("textbox", { name: "Package 1 price" })).toHaveValue("Price on request");
    expect((screen.getByRole("textbox", { name: "Package 1 features" }) as HTMLTextAreaElement).value)
      .toContain("Organic short-form video");
    expect(screen.getByText(/select its Services record, update the fields below, then choose Save record/i)).toBeInTheDocument();
  });

  it("saves updated Social Media package pricing from the admin editor", async () => {
    const { writes, getContent } = setupCollections();
    await screen.findByRole("heading", { name: "Content collections" });
    fireEvent.click(screen.getByRole("button", { name: /social-media-management-namibia/ }));
    fireEvent.change(await screen.findByRole("textbox", { name: "Package 1 price" }), {
      target: { value: "N$ 4,500 / month" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));

    await screen.findByText("Saved to PostgreSQL");
    const savedService = getContent().services.find((service) => service.to === "/social-media-management-namibia");
    expect(savedService?.packages?.[0]?.price).toBe("N$ 4,500 / month");
    expect(writes.at(-1)?.key).toBe("services");
    const savedPackages = (writes.at(-1)?.items.find((item) =>
      (item as { to?: string }).to === "/social-media-management-namibia",
    ) as { packages: Array<{ price: string }> }).packages;
    expect(savedPackages[0]?.price).toBe("N$ 4,500 / month");
  });
});
