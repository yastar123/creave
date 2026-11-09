import { describe, expect, it } from "vitest";

import { getCmsPageDefaultSections } from "@/lib/cms-page-defaults";

function fieldsFor(pageId: string, sectionId: string) {
  const section = getCmsPageDefaultSections(pageId).find((item) => item.id === sectionId);
  expect(section, `${pageId}.${sectionId} should be available to edit`).toBeDefined();
  return section!.fields;
}

describe("editable page content defaults", () => {
  it("provides all copy used by About and Contact pages", () => {
    expect(fieldsFor("about", "hero")).toMatchObject({
      eyebrow: "ABOUT CREVORA",
      buttonLabel: "Start a conversation",
    });
    expect(fieldsFor("about", "intro")).toMatchObject({ eyebrow: "WHO WE ARE" });
    expect(fieldsFor("about", "direction")).toMatchObject({
      eyebrow: "OUR DIRECTION",
      buttonLabel: "Collaborate with us",
      item0Title: "Our Direction",
      item2Title: "Collaborate with Us",
    });
    expect(fieldsFor("contact", "hero")).toMatchObject({
      eyebrow: "CONTACT CREVORA",
      buttonLabel: "Start a private discussion",
    });
    expect(fieldsFor("contact", "intro")).toMatchObject({ eyebrow: "NO PRESSURE" });
    expect(fieldsFor("contact", "details")).toMatchObject({
      headingStart: "Chat via",
      buttonLabel: "Chat via WhatsApp",
    });
  });

  it("provides editable homepage, services, and editorial section copy", () => {
    expect(fieldsFor("home", "hero")).toMatchObject({
      metaLabel: "Independent creative studio",
      metaLocation: "Windhoek, Namibia",
      buttonLabel: "Start a conversation",
      bottomLabel: "Social media. Identity. Content. Digital.",
      image: "",
      video: "",
    });
    expect(fieldsFor("home", "services")).toMatchObject({
      eyebrow: "What we do",
      headingStart: "Our",
      buttonLabel: "All services",
    });
    expect(fieldsFor("home", "why")).toMatchObject({
      eyebrow: "Why CREVORA",
      headingStart: "Not more noise.",
      headingAccent: "More meaning.",
      buttonLabel: "Book a discovery call",
    });
    expect(fieldsFor("home", "trusted")).toMatchObject({
      heading: "Trusted by businesses across Namibia",
      note: "Businesses across Namibia",
    });
    expect(fieldsFor("home", "work")).toMatchObject({
      headingStart: "Different",
      headingAccent: "by design.",
      coverImage: "",
      coverVideo: "",
    });
    expect(fieldsFor("home", "industries")).toMatchObject({
      heading: "One studio — adapted to your business",
      body: "Find out how CREVORA fits your brand, audience and goals.",
      buttonLabel: "Discover possibilities",
      coverImage: "",
      coverVideo: "",
    });
    expect(fieldsFor("home", "process")).toMatchObject({
      eyebrow: "04 — How we work",
      item0Title: "Let’s Talk",
    });
    expect(fieldsFor("services", "hero")).toHaveProperty("eyebrow");
    expect(fieldsFor("services", "showcase")).toMatchObject({
      eyebrow: "(03) — What we do",
      buttonLabel: "All services",
      coreFocusLabel: "Core focus",
    });
    expect(fieldsFor("services", "services-list")).toMatchObject({
      buttonLabel: "Explore the service",
      coreFocusLabel: "Core focus",
    });
    expect(fieldsFor("journal", "articles")).toMatchObject({
      eyebrow: "Journal",
      heading: "Latest articles",
    });
  });

  it("provides editable social and web service package, FAQ, and CTA copy", () => {
    expect(fieldsFor("social-media-management", "hero")["buttonLabel"]).toBe("Request a private discussion");
    expect(fieldsFor("social-media-management", "packages")["buttonLabel"]).toBe("Request private discussion");
    expect(fieldsFor("social-media-management", "faq")).toMatchObject({
      outro: "Still deciding? Let’s talk about which package fits your brand.",
      buttonLabel: "Chat via WhatsApp",
    });
    expect(fieldsFor("social-media-management", "approach")).toMatchObject({
      item0Title: "Strategy-led",
      item2Title: "Measured",
      buttonLabel: "Chat via WhatsApp",
    });
    expect(fieldsFor("web-solutions", "hero")["buttonLabel"]).toBe("Request a private discussion");
    expect(fieldsFor("web-solutions", "packages")["buttonLabel"]).toBe("Request private discussion");
    expect(fieldsFor("web-solutions", "faq")).toMatchObject({
      outro: "Still deciding? Let’s talk about which package fits your business.",
      buttonLabel: "Chat via WhatsApp",
    });
  });
});
