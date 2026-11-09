export type SocialProfile = { name: string; url: string };

export function resolveSocialProfiles(
  profiles: readonly SocialProfile[],
  legacyFooterLinks: string | undefined,
): SocialProfile[] {
  if (profiles.length) return [...profiles];

  return (legacyFooterLinks ?? "").split("\n").flatMap((line) => {
    const [name, url] = line.split("|").map((part) => part?.trim());
    if (!name || !url) return [];
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? [{ name, url }] : [];
    } catch {
      return [];
    }
  });
}

export function serializeSocialProfiles(profiles: readonly SocialProfile[]) {
  return profiles.map(({ name, url }) => `${name}|${url}`).join("\n");
}
