import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getRouter } from "@/router";
import { defaultSiteContent } from "@/lib/studio-content";
import { defaultCmsGlobals } from "@/lib/cms-shared";

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response);
}

async function setupApp(
  initialUrl = "/",
  globals = { navbar: {}, footer: {}, settings: defaultCmsGlobals.settings },
) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);

    if (url.pathname === "/api/cms/public-globals") {
      return jsonResponse({ globals });
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

  it("renders customized desktop/mobile navigation and footer content", async () => {
    await setupApp("/", {
      navbar: {
        primaryLinks: "Studio|/about",
        mobileLinks: "Start|/contact",
        studioNote: "Thoughtful work.\nBuilt with intent.",
        menuDescription: "A creative team for your next chapter.",
        whatsappLabel: "Message the studio",
      },
      footer: {
        description: "Footer studio story.",
        callout: "Let’s build\nsomething lasting.",
        links: "Studio|/about",
        legalLinks: "Terms|/terms",
        socialLinks: "Instagram|https://instagram.com/crevora",
        studioLine: "Built in Windhoek.",
        marqueeText: "Make good things.",
        copyright: "CREVORA Studio.",
        whatsappLabel: "Chat with us",
        backToTopLabel: "Return to top",
        contactButtonLabel: "Start a custom conversation",
      },
      settings: defaultCmsGlobals.settings,
    });

    await screen.findByText("Thoughtful work.");
    expect(document.querySelector(".desktop-nav a[href='/about']")).toHaveTextContent("Studio");
    expect(document.querySelector(".header-studio-note")).toHaveTextContent("Thoughtful work.");
    expect(screen.getByText("Footer studio story.")).toBeInTheDocument();
    expect(screen.getByText("Built in Windhoek.")).toBeInTheDocument();
    expect(screen.getByText(/CREVORA Studio\./)).toBeInTheDocument();
    expect(document.querySelector(".footer-marquee-track")).toHaveTextContent("Make good things.");
    expect(document.querySelector(".footer-nav a[href='/about']")).toHaveTextContent("Studio");
    expect(document.querySelector(".footer-legal a[href='/terms']")).toHaveTextContent("Terms");
    expect(document.querySelector(".footer-socials a[href='https://instagram.com/crevora']")).toHaveAttribute(
      "aria-label",
      "CREVORA on Instagram",
    );

    fireEvent.click(await screen.findByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Navigation menu" });
    expect(within(menu).getByRole("link", { name: /Start/ })).toHaveAttribute("href", "/contact");
    expect(within(menu).getByText(/A creative team for your next chapter/)).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: /Message the studio/ })).toBeInTheDocument();
  });

  it("uses the configured WhatsApp link on homepage calls to action", async () => {
    const whatsappUrl = "https://wa.me/264811112222?text=Hello";
    await setupApp("/", {
      navbar: {},
      footer: {},
      settings: { ...defaultCmsGlobals.settings, whatsapp: whatsappUrl },
    });

    const cta = await screen.findByRole("link", { name: /Book a discovery call/ });
    await waitFor(() => expect(cta).toHaveAttribute("href", whatsappUrl));
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
