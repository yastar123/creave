import { describe, expect, it } from "vitest";

import { resolveSocialProfiles, serializeSocialProfiles } from "@/lib/social-profile-links";

describe("social profile sources", () => {
  it("uses editable social collection profiles ahead of legacy footer content", () => {
    const profiles = [{ name: "Instagram", url: "https://instagram.com/crevora" }];
    expect(resolveSocialProfiles(profiles, "Facebook|https://facebook.com/old-profile")).toEqual(
      profiles,
    );
  });

  it("keeps legacy footer profiles visible until collection profiles are configured", () => {
    expect(
      resolveSocialProfiles(
        [],
        "Instagram|https://instagram.com/crevora\nTikTok|https://tiktok.com/@crevora",
      ),
    ).toEqual([
      { name: "Instagram", url: "https://instagram.com/crevora" },
      { name: "TikTok", url: "https://tiktok.com/@crevora" },
    ]);
  });

  it("ignores invalid legacy profile links and serializes valid collection entries", () => {
    expect(resolveSocialProfiles([], "Instagram|javascript:alert(1)\nMissing URL")).toEqual([]);
    expect(
      serializeSocialProfiles([{ name: "Facebook", url: "https://facebook.com/crevora" }]),
    ).toBe("Facebook|https://facebook.com/crevora");
  });
});
