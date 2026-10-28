import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CmsDashboard } from "@/components/cms-admin";
import type { CmsInquiry, CmsPageRecord } from "@/lib/cms-client";
import { cmsPages } from "@/lib/cms-shared";

const initialSections = [
  {
    id: "intro",
    type: "text" as const,
    title: "Introduction",
    enabled: true,
    fields: { heading: "Welcome", body: "Studio content" },
  },
];

const inquiries: CmsInquiry[] = Array.from({ length: 13 }, (_, index) => ({
  id: String(index + 1),
  name: index === 0 ? "Ada Lovelace" : `Contact ${index + 1}`,
  company: index === 0 ? "Analytical Engines" : null,
  email: index === 0 ? "ada@example.com" : `contact${index + 1}@example.com`,
  phone: "+264 81 123 4567",
  interest: "Brand identity",
  message: index === 0 ? "Please share a project proposal." : `Project request ${index + 1}`,
  whatsappOk: index === 0,
  createdAt: "2026-10-20T10:00:00.000Z",
}));

function jsonResponse(payload: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => payload,
  } as Response);
}

function setupDashboard() {
  const writes: Array<{ url: string; body: Record<string, unknown> }> = [];
  let pages: CmsPageRecord[] = cmsPages.map((page) => ({
    ...page,
    isCustom: false,
    sections: page.id === "home" ? initialSections : [],
    updatedAt: null,
  }));
  let globals: { navbar: Record<string, string>; footer: Record<string, string> } = {
    navbar: { logo: "CREVORA" },
    footer: { email: "hello@crevora.com.na" },
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/api/cms/admin/pages" && !init?.method) {
      return jsonResponse({ pages });
    }
    if (url.pathname === "/api/cms/admin/globals" && !init?.method) {
      return jsonResponse({ globals });
    }
    if (url.pathname.startsWith("/api/cms/admin/inquiries")) {
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const matching = inquiries.filter((inquiry) =>
        [inquiry.name, inquiry.company, inquiry.email, inquiry.interest, inquiry.message]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search)),
      );
      const page = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
      const offset = (page - 1) * pageSize;
      return jsonResponse({
        inquiries: matching.slice(offset, offset + pageSize),
        total: matching.length,
        page,
        pageSize,
      });
    }

    if (init?.method === "POST" && url.pathname === "/api/cms/admin/pages") {
      const body = JSON.parse(String(init.body ?? "{}")) as { title: string; slug: string };
      const page: CmsPageRecord = {
        id: "custom-our-approach",
        title: body.title,
        route: `/pages/${body.slug}`,
        isCustom: true,
        sections: [],
        updatedAt: null,
      };
      pages = [...pages, page];
      return jsonResponse({ page });
    }

    if (init?.method === "PATCH" && url.pathname.startsWith("/api/cms/admin/pages/")) {
      const pageId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
      const body = JSON.parse(String(init.body ?? "{}")) as { title: string; slug: string };
      pages = pages.map((page) => page.id === pageId
        ? { ...page, title: body.title, route: `/pages/${body.slug}` }
        : page);
      return jsonResponse({ page: pages.find((page) => page.id === pageId) });
    }

    if (init?.method === "DELETE" && url.pathname.startsWith("/api/cms/admin/pages/")) {
      const pageId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
      pages = pages.filter((page) => page.id !== pageId);
      return jsonResponse({ ok: true, pageId });
    }

    if (init?.method === "PUT") {
      const body = JSON.parse(String(init.body ?? "{}")) as Record<string, unknown>;
      writes.push({ url: url.pathname, body });
      if (url.pathname.startsWith("/api/cms/admin/pages/")) {
        const pageId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
        pages = pages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                sections: body["sections"] as CmsPageRecord["sections"],
                updatedAt: "2026-10-26T00:00:00.000Z",
              }
            : page,
        );
        return jsonResponse({
          ok: true,
          sections: body["sections"],
          updatedAt: "2026-10-26T00:00:00.000Z",
        });
      }
      const key = url.pathname.split("/").at(-1);
      if (key === "navbar" || key === "footer") {
        globals = { ...globals, [key]: body["content"] as Record<string, string> };
        return jsonResponse({ ok: true, content: globals[key] });
      }
    }

    return Promise.resolve({
      ok: false,
      json: async () => ({ error: `Unexpected test request: ${url.pathname}` }),
    } as Response);
  });
  vi.stubGlobal("fetch", fetchMock);

  const onLogout = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <CmsDashboard onLogout={onLogout} />
    </QueryClientProvider>,
  );

  return { fetchMock, onLogout, writes };
}

describe("CMS admin dashboard", () => {
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the overview, opens the inbox, searches, expands, paginates, and signs out", async () => {
    const { onLogout, fetchMock } = setupDashboard();

    expect(
      await screen.findByRole("heading", { name: "Your site, at a glance." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Editable pages")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Inbox/ }));
    expect(await screen.findByRole("heading", { name: "Contact inbox" })).toBeInTheDocument();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Details$/ })[0]!);
    expect(await screen.findByRole("link", { name: /ada@example.com/ })).toHaveAttribute(
      "href",
      "mailto:ada@example.com",
    );
    expect(screen.getByText("WhatsApp contact permitted")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search name, company, email, or message"), {
      target: { value: "Ada" },
    });
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("search=Ada"),
        expect.objectContaining({ credentials: "include" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onLogout).toHaveBeenCalledOnce();
  }, 15_000);

  it("edits a page, adds content, changes section visibility and order, and deletes a section", async () => {
    const { writes } = setupDashboard();

    await screen.findByRole("heading", { name: "Your site, at a glance." });
    fireEvent.click(screen.getByRole("button", { name: /^Home/ }));
    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "heading value" }), {
      target: { value: "A new home page heading" },
    });
    await waitFor(
      () =>
        expect(
          writes.some(
            ({ body }) =>
              (body["sections"] as Array<{ fields: Record<string, string> }> | undefined)?.[0]
                ?.fields["heading"] === "A new home page heading",
          ),
        ).toBe(true),
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByRole("button", { name: /Add section/ }));
    expect(await screen.findByRole("button", { name: /^Text/ })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Section title" }), {
      target: { value: "New feature" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "New field name" }), {
      target: { value: "eyebrow" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Starting value" }), {
      target: { value: "Made with care" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(await screen.findByRole("textbox", { name: "eyebrow value" })).toHaveValue(
      "Made with care",
    );

    const newSection = screen
      .getByRole("button", { name: /^New feature/ })
      .closest(".ca-section-card") as HTMLElement | null;
    if (!newSection) throw new Error("The new CMS section card was not rendered.");
    fireEvent.click(within(newSection!).getByRole("button", { name: "Disable section" }));
    expect(within(newSection!).getByRole("button", { name: "Enable section" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    fireEvent.click(within(newSection!).getByRole("button", { name: "Move section up" }));
    fireEvent.click(within(newSection!).getByRole("button", { name: "Delete section" }));
    expect(await screen.findByRole("button", { name: /^Introduction/ })).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(writes.some(({ url }) => url === "/api/cms/admin/pages/home")).toBe(true);
  });

  it("edits shared navigation and footer fields and saves each change", async () => {
    const { writes } = setupDashboard();

    await screen.findByRole("heading", { name: "Your site, at a glance." });
    fireEvent.click(screen.getByRole("button", { name: /^Navigation/ }));
    expect(await screen.findByRole("heading", { name: "Navigation" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "New field name" }), {
      target: { value: "primaryLink" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Starting value" }), {
      target: { value: "Home" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    await waitFor(
      () => expect(writes.some(({ url }) => url === "/api/cms/admin/globals/navbar")).toBe(true),
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByRole("button", { name: /^Footer/ }));
    expect(await screen.findByRole("heading", { name: "Footer" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "New field name" }), {
      target: { value: "copyright" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Starting value" }), {
      target: { value: "© CREVORA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    await waitFor(
      () => expect(writes.some(({ url }) => url === "/api/cms/admin/globals/footer")).toBe(true),
      { timeout: 3000 },
    );
  });

  it("creates, renames, and deletes a custom page from the page menu", async () => {
    const { fetchMock } = setupDashboard();

    await screen.findByRole("heading", { name: "Your site, at a glance." });
    fireEvent.click(screen.getByRole("button", { name: "Create page" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Page title" }), {
      target: { value: "Our Approach" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Create page" }).at(-1)!);

    expect(await screen.findByRole("heading", { name: "Our Approach" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cms/admin/pages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Our Approach", slug: "our-approach" }),
      }),
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Page title" }), {
      target: { value: "Our Method" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /URL slug/ }), {
      target: { value: "our-method" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save page details" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/cms/admin/pages/custom-our-approach",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /Delete page/ }));
    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cms/admin/pages/custom-our-approach",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
