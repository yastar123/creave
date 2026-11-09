import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SocialIcon } from "@/components/social-icon";

describe("social profile icons", () => {
  it.each([
    ["IG", "Instagram"],
    ["instagram", "Instagram"],
    ["FB", "Facebook"],
    ["facebook", "Facebook"],
    ["tiktok", "TikTok"],
    ["LinkedIn", "LinkedIn"],
  ])("recognizes %s as %s", (name) => {
    const { container } = render(<SocialIcon name={name} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("keeps a readable label for an unsupported platform", () => {
    const { getByText } = render(<SocialIcon name="Threads" />);

    expect(getByText("Threads")).toBeInTheDocument();
  });
});
