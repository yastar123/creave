import { describe, expect, it } from "vitest";

import { parseCmsMediaOverrides, resolveCmsMedia, validateCmsMediaOverrides } from "@/lib/cms-media-overrides";
import { getCmsPageDefaultSections } from "@/lib/cms-page-defaults";

describe("CMS page media overrides", () => {
  it("applies image and video overrides by slug or title, including cleared values", () => {
    const project = { slug: "mora", name: "MORA", image: "/old.jpg", video: "/old.mp4" };
    const overrides = parseCmsMediaOverrides(JSON.stringify([
      { key: "MORA", image: "/new.jpg", video: "" },
    ]));

    expect(resolveCmsMedia(project, [project.slug, project.name], overrides)).toEqual({
      ...project,
      image: "/new.jpg",
      video: "",
    });
  });

  it("rejects empty or duplicate media keys", () => {
    expect(validateCmsMediaOverrides('[{"key":"","image":"","video":""}]')).toContain("needs a name or slug");
    expect(validateCmsMediaOverrides('[{"key":"mora"},{"key":"mora"}]')).toContain("unique");
    expect(validateCmsMediaOverrides("not json")).toContain("valid list");
    expect(validateCmsMediaOverrides('[{"key":"mora","image":"/mora.jpg","video":""}]')).toBeNull();
  });

  it("provides inline media override fields for every collection-driven visual page", () => {
    const sectionIds = (pageId: string) => getCmsPageDefaultSections(pageId)
      .filter(section => "mediaItems" in section.fields)
      .map(section => section.id);

    expect(sectionIds("home")).toEqual(expect.arrayContaining(["services", "trusted", "industries", "work", "journal"]));
    expect(sectionIds("about")).toContain("gallery");
    expect(sectionIds("services")).toEqual(expect.arrayContaining(["showcase", "work"]));
    expect(sectionIds("social-media-portfolio")).toContain("gallery");
    expect(sectionIds("work")).toContain("projects");
    expect(sectionIds("case-studies")).toEqual(expect.arrayContaining(["hero", "gallery"]));
    expect(sectionIds("journal")).toContain("articles");
    expect(sectionIds("journal-articles")).toContain("hero");
  });
});
