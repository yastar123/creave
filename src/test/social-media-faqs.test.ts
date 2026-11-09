import { describe, expect, it } from "vitest";

import { getCmsPageDefaultSections } from "@/lib/cms-page-defaults";
import {
  parseSocialMediaFaqs,
  serializeSocialMediaFaqs,
  socialMediaFaqs,
} from "@/lib/social-media-faqs";

describe("social media FAQ CMS content", () => {
  it("seeds all existing FAQs into the editable page section", () => {
    const section = getCmsPageDefaultSections("social-media-management").find(
      (item) => item.id === "faq",
    );

    expect(section?.fields["items"]).toBe(serializeSocialMediaFaqs(socialMediaFaqs));
    expect(parseSocialMediaFaqs(section?.fields["items"] ?? "")).toHaveLength(
      socialMediaFaqs.length,
    );
  });

  it("parses edited questions and multiple answer paragraphs", () => {
    expect(parseSocialMediaFaqs("Can I change this? | Yes. | Add a second paragraph.")).toEqual([
      {
        q: "Can I change this?",
        paragraphs: ["Yes.", "Add a second paragraph."],
      },
    ]);
  });

  it("ignores incomplete FAQ lines rather than rendering broken records", () => {
    expect(
      parseSocialMediaFaqs("Missing answer\n | Blank question | Answer\nComplete? | Yes."),
    ).toEqual([{ q: "Complete?", paragraphs: ["Yes."] }]);
  });
});
