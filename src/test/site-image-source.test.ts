import { describe, expect, it } from "vitest";

import heroObsidian from "@/assets/hero-obsidian.webp";
import socialVisual from "@/assets/svc-social.webp";
import { resolveSiteImageSource } from "@/lib/site-image-source";

describe("legacy site image sources", () => {
  it("maps old CMS asset paths to bundled images", () => {
    expect(resolveSiteImageSource("/src/assets/svc-social.webp")).toBe(socialVisual);
    expect(resolveSiteImageSource("https://old.example/src/assets/hero-obsidian.webp?width=800"))
      .toBe(heroObsidian);
  });

  it("preserves current uploads and unknown URLs", () => {
    expect(resolveSiteImageSource("/uploads/client-logo.png")).toBe("/uploads/client-logo.png");
    expect(resolveSiteImageSource("https://cdn.example/client-logo.png")).toBe("https://cdn.example/client-logo.png");
    expect(resolveSiteImageSource("/src/assets/unknown.webp")).toBe("/src/assets/unknown.webp");
  });
});
