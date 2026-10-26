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
    fireEvent.change(await screen.findByRole("textbox", { name: "Date" }), {
      target: { value: "not-a-date" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "One or more records do not match this collection.",
    );
  });
});
