export const cmsPages = [
  { id: "home", title: "Home", route: "/" },
  { id: "about", title: "About", route: "/about" },
  { id: "services", title: "Services", route: "/services" },
  { id: "social-media-management", title: "Social Media Management", route: "/social-media-management-namibia" },
  { id: "brand-identity", title: "Brand Identity", route: "/brand-identity-namibia" },
  { id: "creative-visuals", title: "Creative Visuals & Motion", route: "/creative-visuals-motion-namibia" },
  { id: "web-solutions", title: "Web Solutions", route: "/web-solutions-namibia" },
  { id: "social-media-portfolio", title: "Social Media Portfolio", route: "/social-media-portfolio" },
  { id: "work", title: "Work", route: "/work" },
  { id: "case-studies", title: "Case Studies", route: "/work/*" },
  { id: "journal", title: "Journal", route: "/journal" },
  { id: "journal-articles", title: "Journal Articles", route: "/journal/*" },
  { id: "contact", title: "Contact", route: "/contact" },
  { id: "privacy-policy", title: "Privacy Policy", route: "/privacy-policy" },
  { id: "terms", title: "Terms", route: "/terms" },
  { id: "maintenance", title: "Maintenance", route: "/maintenance" },
] as const;

export type CmsPage = (typeof cmsPages)[number];
export type CmsPageId = CmsPage["id"];
export const cmsPageIds = new Set<string>(cmsPages.map((page) => page.id));

export const cmsSectionTypes = [
  "hero",
  "text",
  "image-text",
  "cards",
  "gallery",
  "faq",
  "stats",
  "cta",
  "contact",
] as const;

export type CmsSectionType = (typeof cmsSectionTypes)[number];
export type CmsSection = {
  id: string;
  type: CmsSectionType;
  title: string;
  enabled: boolean;
  fields: Record<string, string>;
};
