import * as z from "zod";

const localPath = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"), "Use a site-relative path.");

const publicImage = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) => (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value),
    "Use a site-relative path or an HTTP(S) image URL.",
  );

const externalUrl = z.string().trim().url().max(2048).refine(
  (value) => /^https?:\/\//i.test(value),
  "Use an HTTP(S) URL.",
);

export const siteContentCollectionSchemas = {
  services: z.array(
    z.object({
      title: z.string().trim().min(1).max(160),
      to: localPath,
      menuNote: z.string().trim().max(240),
      short: z.string().trim().min(1).max(300),
      description: z.string().trim().min(1).max(2000),
      tags: z.array(z.string().trim().min(1).max(120)).max(20),
      detail: z.string().trim().min(1).max(2000),
    }),
  ).max(80),
  projects: z.array(
    z.object({
      slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
      name: z.string().trim().min(1).max(160),
      client: z.string().trim().max(200),
      year: z.string().trim().max(20),
      category: z.string().trim().min(1).max(160),
      services: z.array(z.string().trim().min(1).max(160)).max(20),
      image: publicImage,
      alt: z.string().trim().max(500),
      title: z.string().trim().min(1).max(300),
      description: z.string().trim().min(1).max(4000),
      challenge: z.string().trim().max(4000),
      approach: z.string().trim().max(4000),
      result: z.string().trim().max(4000),
      gallery: z.array(z.object({ image: publicImage, alt: z.string().trim().max(500) })).max(40),
    }),
  ).max(200),
  articles: z.array(
    z.object({
      slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
      category: z.string().trim().min(1).max(120),
      title: z.string().trim().min(1).max(300),
      excerpt: z.string().trim().min(1).max(1000),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      author: z.string().trim().min(1).max(160),
      body: z.array(z.string().trim().min(1).max(10000)).min(1).max(100),
      related: z.object({
        label: z.string().trim().min(1).max(160),
        to: localPath,
      }),
      image: publicImage.optional(),
      imageAlt: z.string().trim().max(500).optional(),
    }),
  ).max(500),
  gallery: z.array(
    z.object({
      title: z.string().trim().min(1).max(160),
      category: z.string().trim().min(1).max(160),
      image: publicImage,
      alt: z.string().trim().max(500),
    }),
  ).max(200),
  trustedBy: z.array(
    z.object({
      name: z.string().trim().min(1).max(160),
      logo: publicImage.optional(),
      url: externalUrl.optional(),
    }),
  ).max(100),
  socials: z.array(
    z.object({
      name: z.string().trim().min(1).max(80),
      url: externalUrl,
    }),
  ).max(50),
  legalLinks: z.array(
    z.object({
      title: z.string().trim().min(1).max(120),
      to: localPath,
    }),
  ).max(30),
} as const;

export const siteContentCollectionKeys = Object.keys(
  siteContentCollectionSchemas,
) as (keyof typeof siteContentCollectionSchemas)[];

export const siteContentSchema = z.object({
  services: siteContentCollectionSchemas.services,
  projects: siteContentCollectionSchemas.projects,
  articles: siteContentCollectionSchemas.articles,
  gallery: siteContentCollectionSchemas.gallery,
  trustedBy: siteContentCollectionSchemas.trustedBy,
  socials: siteContentCollectionSchemas.socials,
  legalLinks: siteContentCollectionSchemas.legalLinks,
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SiteContentCollection = keyof SiteContent;

export function collectionItemIdentity(
  collection: SiteContentCollection,
  value: unknown,
): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const item = value as Record<string, unknown>;
  const identityKey: Record<SiteContentCollection, string> = {
    services: "to",
    projects: "slug",
    articles: "slug",
    gallery: "title",
    trustedBy: "name",
    socials: "name",
    legalLinks: "to",
  };
  const identity = item[identityKey[collection]];
  return typeof identity === "string" ? identity.trim().toLowerCase() : "";
}
