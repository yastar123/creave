export type CmsMediaOverride = {
  key: string;
  image?: string;
  video?: string;
};

export function isCmsMediaOverridesJson(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      && parsed.every((item) =>
        Boolean(item)
        && typeof item === "object"
        && "key" in item
        && typeof item.key === "string"
        && (!("image" in item) || typeof item.image === "string")
        && (!("video" in item) || typeof item.video === "string"),
      );
  } catch {
    return false;
  }
}

export function validateCmsMediaOverrides(value: string): string | null {
  if (!isCmsMediaOverridesJson(value)) return "Media overrides must be a valid list.";
  const parsed = JSON.parse(value) as CmsMediaOverride[];
  const keys = parsed.map((item) => item.key.trim());
  if (keys.some((key) => !key)) return "Each media override needs a name or slug.";
  if (new Set(keys).size !== keys.length) return "Each media override must use a unique name or slug.";
  return null;
}

export function parseCmsMediaOverrides(value: string | undefined): CmsMediaOverride[] {
  if (!value || !isCmsMediaOverridesJson(value)) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CmsMediaOverride =>
      Boolean(item)
      && typeof item === "object"
      && "key" in item
      && typeof item.key === "string"
      && (!("image" in item) || typeof item.image === "string")
      && (!("video" in item) || typeof item.video === "string"),
    );
  } catch {
    return [];
  }
}

export function resolveCmsMedia<T extends { image?: string | undefined; video?: string | undefined }>(
  item: T,
  key: string | string[],
  overrides: CmsMediaOverride[],
): T {
  const keys = Array.isArray(key) ? key : [key];
  const override = overrides.find((candidate) => keys.includes(candidate.key));
  if (!override) return item;
  return {
    ...item,
    ...("image" in override ? { image: override.image } : {}),
    ...("video" in override ? { video: override.video } : {}),
  };
}
