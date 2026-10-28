import { describe, expect, it } from "vitest";

import { CMS_PREVIEW_MESSAGE, isCmsPreviewUpdate } from "@/lib/cms-preview";

describe("CMS live preview messages", () => {
  it("accepts a valid page and global draft", () => {
    expect(isCmsPreviewUpdate({
      type: CMS_PREVIEW_MESSAGE,
      pageId: "home",
      sections: [{ id: "hero", type: "hero", title: "Hero", enabled: true, fields: { heading: "Draft" } }],
      globals: { navbar: { primaryLinks: "Home|/" }, footer: {} },
    })).toBe(true);
  });

  it("rejects unknown message types and malformed sections", () => {
    expect(isCmsPreviewUpdate({ type: "other", pageId: "home" })).toBe(false);
    expect(isCmsPreviewUpdate({
      type: CMS_PREVIEW_MESSAGE,
      pageId: "home",
      sections: [{ id: "hero", type: "unknown", title: "Hero", enabled: true, fields: {} }],
    })).toBe(false);
  });
});
