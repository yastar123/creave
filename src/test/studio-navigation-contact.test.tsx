import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getRouter } from "@/router";
import { defaultSiteContent } from "@/lib/studio-content";

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response);
}

async function setupApp(initialUrl = "/") {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);

    if (url.pathname === "/api/cms/public-globals") {
      return jsonResponse({ globals: { navbar: {}, footer: {} } });
    }
    if (url.pathname.startsWith("/api/cms/public/")) {
      return jsonResponse({
        page: { id: "home", title: "Home", description: "Test page" },
        sections: [],
      });
    }
    if (url.pathname === "/api/contact" && init?.method === "POST") {
      return jsonResponse({ ok: true }, 201);
    }

    return jsonResponse({ error: `Unexpected request: ${url.pathname}` }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  const router = getRouter(defaultSiteContent, initialUrl);
  await router.load();
  render(<RouterProvider router={router} />);
  return fetchMock;
}

describe("public navigation and contact form", () => {
  beforeEach(() => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("opens the mobile menu, navigates to a page, and closes on Escape", async () => {
    await setupApp();

    fireEvent.click(await screen.findByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Navigation menu" });
    expect(
      within(menu).getByRole("link", { name: /Social Media Marketing & Branding/ }),
    ).toHaveAttribute("href", "/social-media-management-namibia");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const aboutLink = within(
      screen.getByRole("dialog", { name: "Navigation menu" }),
    ).getByRole("link", { name: /About/ });
    aboutLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(aboutLink);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("opens the desktop services menu and exposes each service route", async () => {
    await setupApp();
    await screen.findByRole("button", { name: "Open menu" });

    const servicesMenu = document.querySelector(".nav-services");
    expect(servicesMenu).not.toBeNull();
    fireEvent.mouseEnter(servicesMenu!);

    const group = screen.getByRole("group", { name: "Service pages" });
    expect(within(group).getByRole("link", { name: /Social Media Marketing & Branding/ })).toHaveAttribute(
      "href",
      "/social-media-management-namibia",
    );
    expect(within(group).getByRole("link", { name: /Brand Identity & Visual/ })).toHaveAttribute(
      "href",
      "/brand-identity-namibia",
    );
    expect(within(group).getByRole("link", { name: /Creative Content & Motion/ })).toHaveAttribute(
      "href",
      "/creative-visuals-motion-namibia",
    );
    expect(within(group).getByRole("link", { name: /Web & Digital Solutions/ })).toHaveAttribute(
      "href",
      "/web-solutions-namibia",
    );
  });

  it("validates required fields and privacy consent before sending", async () => {
    const fetchMock = await setupApp("/contact");

    fireEvent.click(await screen.findByRole("button", { name: /Save enquiry/ }));

    expect(await screen.findByText("Please check the highlighted fields and try again.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("saves a valid enquiry and provides a WhatsApp continuation link", async () => {
    const fetchMock = await setupApp("/contact");

    fireEvent.change(await screen.findByPlaceholderText("Who are we talking to?"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your brand/company name"), {
      target: { value: "Analytical Engines" },
    });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("+264"), {
      target: { value: "+264 81 123 4567" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Share a bit about your brand, what you’re trying to achieve, or what feels unclear right now. There’s no need to have everything figured out.",
      ),
      { target: { value: "We are building a new brand and would like to talk." } },
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /I agree that CREVORA may store my details/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Save enquiry/ }));

    expect(
      await screen.findByText(
        "Thank you! Your enquiry has been saved. Continue to WhatsApp to review and send your message.",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"privacyConsent":true'),
      }),
    );
    expect(screen.getByRole("link", { name: /Continue to WhatsApp/ })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/264815781719?text="),
    );
  });
});
