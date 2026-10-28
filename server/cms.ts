import type { Express, NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import * as z from "zod";
import { cmsPages, cmsPageIds, cmsSectionTypes, type CmsSection } from "../src/lib/cms-shared";
import {
  collectionItemIdentity,
  siteContentCollectionKeys,
  siteContentCollectionSchemas,
  siteContentSchema,
  type SiteContent,
  type SiteContentCollection,
} from "../src/lib/site-content-shared";
import { getAdminSession } from "./auth";

export const cmsSectionSchema = z.object({
  id: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  type: z.enum(cmsSectionTypes),
  title: z.string().trim().min(1).max(160),
  enabled: z.boolean(),
  fields: z.record(z.string().max(80), z.string().max(8000)).default({}),
});

export const cmsSectionsSchema = z.array(cmsSectionSchema).max(80);

const cmsPageTitleSchema = z.string().trim().min(1).max(120);
const cmsPageSlugSchema = z.string().trim().toLowerCase().min(1).max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");
const globalKeys = ["navbar", "footer"] as const;
const cmsGlobalSchema = z.record(z.string().max(80), z.string().max(8000)).refine(
  (value) => Object.keys(value).length <= 100,
  "Too many content fields.",
);

export async function initializeSiteContent(pool: Pool, defaults: SiteContent) {
  const validated = siteContentSchema.parse(defaults);
  for (const key of siteContentCollectionKeys) {
    await pool.query(
      `INSERT INTO public.cms_content_collections (collection_key, items, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (collection_key) DO NOTHING`,
      [key, JSON.stringify(validated[key])],
    );
  }
}

export async function initializeCmsPages(pool: Pool) {
  for (const page of cmsPages) {
    await pool.query(
      `INSERT INTO public.cms_pages (page_id, title, route, is_custom, sections, updated_at)
       VALUES ($1, $2, $3, FALSE, '[]'::jsonb, NOW())
       ON CONFLICT (page_id) DO UPDATE
       SET title = EXCLUDED.title, route = EXCLUDED.route
       WHERE public.cms_pages.is_custom = FALSE`,
      [page.id, page.title, page.route],
    );
  }
}

export async function loadSiteContent(pool: Pool): Promise<SiteContent> {
  const result = await pool.query<{ collection_key: string; items: unknown }>(
    "SELECT collection_key, items FROM public.cms_content_collections",
  );
  const rows = new Map(result.rows.map((row) => [row.collection_key, row.items]));
  const content: Record<string, unknown> = {};

  for (const key of siteContentCollectionKeys) {
    if (!rows.has(key)) {
      throw new Error(`The PostgreSQL content collection "${key}" has not been initialized.`);
    }
    const parsed = siteContentCollectionSchemas[key].safeParse(rows.get(key));
    if (!parsed.success) {
      throw new Error(`The PostgreSQL content collection "${key}" contains invalid data.`);
    }
    content[key] = parsed.data;
  }

  return siteContentSchema.parse(content);
}

export function registerCmsRoutes(app: Express, pool: Pool) {
  app.get("/api/cms/public-collections", async (_request, response) => {
    const content = await loadSiteContent(pool);
    response.setHeader("Cache-Control", "no-store");
    response.json({ content });
  });

  app.get("/api/cms/public/:pageId", async (request, response) => {
    const pageId = request.params["pageId"] ?? "";
    const customRoute = pageId.startsWith("custom-route-")
      ? `/pages/${pageId.slice("custom-route-".length)}`
      : null;
    const result = await pool.query<{
      page_id: string;
      title: string;
      route: string;
      is_custom: boolean;
      sections: CmsSection[];
      updated_at: Date | null;
    }>(
      `SELECT page_id, title, route, is_custom, sections, updated_at
       FROM public.cms_pages
       WHERE page_id = $1 OR ($2::text IS NOT NULL AND route = $2)
       LIMIT 1`,
      [pageId, customRoute],
    );
    const stored = result.rows[0];
    const fallback = cmsPages.find((item) => item.id === pageId);
    if (!stored && !fallback) {
      response.status(404).json({ error: "CMS page not found." });
      return;
    }

    const page = stored
      ? {
          id: stored.page_id,
          title: stored.title || fallback?.title || "Untitled page",
          route: stored.route || fallback?.route || "",
          isCustom: stored.is_custom,
        }
      : { ...fallback!, isCustom: false };
    response.setHeader("Cache-Control", "no-store");
    response.json({ page, sections: stored?.sections ?? [] });
  });

  app.get("/api/cms/public-globals", async (_request, response) => {
    const result = await pool.query<{ content_key: string; content: Record<string, string> }>(
      "SELECT content_key, content FROM public.cms_globals WHERE content_key = ANY($1::text[])",
      [[...globalKeys]],
    );
    const saved = new Map(result.rows.map((row) => [row.content_key, row.content]));
    response.setHeader("Cache-Control", "no-store");
    response.json({
      globals: {
        navbar: saved.get("navbar") ?? {},
        footer: saved.get("footer") ?? {},
      },
    });
  });

  app.use("/api/cms/admin", createAdminGuard());

  app.get("/api/cms/admin/collections", async (_request, response) => {
    const content = await loadSiteContent(pool);
    response.setHeader("Cache-Control", "no-store");
    response.json({ content });
  });

  app.put("/api/cms/admin/collections/:collectionKey", async (request, response) => {
    const key = request.params["collectionKey"] ?? "";
    if (!siteContentCollectionKeys.includes(key as SiteContentCollection)) {
      response.status(404).json({ error: "Content collection not found." });
      return;
    }
    const collectionKey = key as SiteContentCollection;
    const parsed = z.object({ items: z.unknown() }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "The collection payload is invalid." });
      return;
    }
    const collection = siteContentCollectionSchemas[collectionKey].safeParse(parsed.data.items);
    if (!collection.success) {
      response.status(400).json({
        error: "One or more records do not match this collection.",
        details: collection.error.flatten(),
      });
      return;
    }

    const items = collection.data as unknown[];
    const identities = items.map((item) => collectionItemIdentity(collectionKey, item));
    if (identities.some((identity) => !identity) || new Set(identities).size !== identities.length) {
      response.status(400).json({ error: "Every record must have a unique identifier." });
      return;
    }

    const serialized = JSON.stringify(items);
    if (Buffer.byteLength(serialized, "utf8") > 700_000) {
      response.status(413).json({ error: "This collection is too large to save." });
      return;
    }

    await pool.query(
      `INSERT INTO public.cms_content_collections (collection_key, items, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (collection_key) DO UPDATE
       SET items = EXCLUDED.items, updated_at = NOW()`,
      [collectionKey, serialized],
    );

    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, collectionKey, items });
  });

  app.get("/api/cms/admin/inquiries", async (request, response) => {
    const parsed = z.object({
      page: z.coerce.number().int().min(1).max(100_000).default(1),
      pageSize: z.coerce.number().int().min(1).max(50).default(20),
      search: z.string().trim().max(120).default(""),
    }).safeParse(request.query);

    if (!parsed.success) {
      response.status(400).json({ error: "The inbox search or page is invalid." });
      return;
    }

    const { page, pageSize, search } = parsed.data;
    const offset = (page - 1) * pageSize;
    const where = search
      ? `WHERE (
          POSITION(LOWER($1) IN LOWER(name)) > 0 OR
          POSITION(LOWER($1) IN LOWER(COALESCE(company, ''))) > 0 OR
          POSITION(LOWER($1) IN LOWER(email)) > 0 OR
          POSITION(LOWER($1) IN LOWER(interest)) > 0 OR
          POSITION(LOWER($1) IN LOWER(message)) > 0
        )`
      : "";
    const countValues = search ? [search] : [];
    const listValues = search
      ? [search, pageSize, offset]
      : [pageSize, offset];
    const limitParameter = search ? "$2" : "$1";
    const offsetParameter = search ? "$3" : "$2";

    const [countResult, inquiriesResult] = await Promise.all([
      pool.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
         FROM public.contact_inquiries
         ${where}`,
        countValues,
      ),
      pool.query<{
        id: string;
        name: string;
        company: string | null;
        email: string;
        phone: string;
        interest: string;
        message: string;
        whatsappOk: boolean;
        createdAt: Date;
      }>(
        `SELECT id, name, company, email, phone, interest, message,
                whatsapp_ok AS "whatsappOk", created_at AS "createdAt"
         FROM public.contact_inquiries
         ${where}
         ORDER BY created_at DESC, id DESC
         LIMIT ${limitParameter} OFFSET ${offsetParameter}`,
        listValues,
      ),
    ]);

    response.setHeader("Cache-Control", "no-store");
    response.json({
      inquiries: inquiriesResult.rows,
      total: Number(countResult.rows[0]?.total ?? 0),
      page,
      pageSize,
    });
  });

  app.get("/api/cms/admin/pages", async (_request, response) => {
    const result = await pool.query<{
      page_id: string;
      title: string;
      route: string;
      is_custom: boolean;
      sections: CmsSection[];
      updated_at: Date | null;
    }>(
      "SELECT page_id, title, route, is_custom, sections, updated_at FROM public.cms_pages",
    );
    const saved = new Map(result.rows.map((row) => [row.page_id, row]));

    response.setHeader("Cache-Control", "no-store");
    response.json({
      pages: [
        ...cmsPages.map((page) => {
          const row = saved.get(page.id);
          return {
            ...page,
            isCustom: false,
            sections: row?.sections ?? [],
            updatedAt: row?.updated_at ?? null,
          };
        }),
        ...result.rows
          .filter((row) => row.is_custom)
          .map((row) => ({
            id: row.page_id,
            title: row.title,
            route: row.route,
            isCustom: true,
            sections: row.sections,
            updatedAt: row.updated_at,
          })),
      ],
    });
  });

  app.post("/api/cms/admin/pages", async (request, response) => {
    const parsed = z.object({
      title: cmsPageTitleSchema,
      slug: cmsPageSlugSchema,
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Enter a valid page title and URL slug." });
      return;
    }

    const id = `custom-${randomUUID()}`;
    const route = `/pages/${parsed.data.slug}`;
    try {
      const result = await pool.query<{
        page_id: string;
        title: string;
        route: string;
        is_custom: boolean;
        sections: CmsSection[];
        updated_at: Date;
      }>(
        `INSERT INTO public.cms_pages (page_id, title, route, is_custom, sections, updated_at)
         VALUES ($1, $2, $3, TRUE, '[]'::jsonb, NOW())
         RETURNING page_id, title, route, is_custom, sections, updated_at`,
        [id, parsed.data.title, route],
      );
      const row = result.rows[0];
      response.status(201).json({
        page: {
          id: row?.page_id ?? id,
          title: row?.title ?? parsed.data.title,
          route: row?.route ?? route,
          isCustom: true,
          sections: row?.sections ?? [],
          updatedAt: row?.updated_at ?? new Date(),
        },
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        response.status(409).json({ error: "A page with that URL slug already exists." });
        return;
      }
      throw error;
    }
  });

  app.patch("/api/cms/admin/pages/:pageId", async (request, response) => {
    const pageId = request.params["pageId"] ?? "";
    const parsed = z.object({
      title: cmsPageTitleSchema,
      slug: cmsPageSlugSchema,
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Enter a valid page title and URL slug." });
      return;
    }
    const route = `/pages/${parsed.data.slug}`;
    try {
      const result = await pool.query<{ page_id: string; title: string; route: string }>(
        `UPDATE public.cms_pages
         SET title = $2, route = $3, updated_at = NOW()
         WHERE page_id = $1 AND is_custom = TRUE
         RETURNING page_id, title, route`,
        [pageId, parsed.data.title, route],
      );
      const page = result.rows[0];
      if (!page) {
        response.status(404).json({ error: "Custom page not found." });
        return;
      }
      response.setHeader("Cache-Control", "no-store");
      response.json({ page: { ...page, isCustom: true } });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        response.status(409).json({ error: "A page with that URL slug already exists." });
        return;
      }
      throw error;
    }
  });

  app.delete("/api/cms/admin/pages/:pageId", async (request, response) => {
    const pageId = request.params["pageId"] ?? "";
    const result = await pool.query(
      "DELETE FROM public.cms_pages WHERE page_id = $1 AND is_custom = TRUE RETURNING page_id",
      [pageId],
    );
    if (!result.rows.length) {
      response.status(404).json({ error: "Custom page not found." });
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, pageId });
  });

  app.put("/api/cms/admin/pages/:pageId", async (request, response) => {
    const pageId = request.params["pageId"] ?? "";
    const storedPage = await pool.query<{ page_id: string }>(
      "SELECT page_id FROM public.cms_pages WHERE page_id = $1",
      [pageId],
    );
    if (!storedPage.rows.length && !cmsPageIds.has(pageId)) {
      response.status(404).json({ error: "CMS page not found." });
      return;
    }

    const parsed = z.object({ sections: cmsSectionsSchema }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "The page sections are invalid.", details: parsed.error.flatten().fieldErrors });
      return;
    }

    const sections = parsed.data.sections;
    if (new Set(sections.map((section) => section.id)).size !== sections.length) {
      response.status(400).json({ error: "Each section must have a unique ID." });
      return;
    }

    const serialized = JSON.stringify(sections);
    if (Buffer.byteLength(serialized, "utf8") > 400_000) {
      response.status(413).json({ error: "This page is too large to save." });
      return;
    }

    const result = await pool.query<{ updated_at: Date }>(
      `INSERT INTO public.cms_pages (page_id, sections, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (page_id) DO UPDATE
       SET sections = EXCLUDED.sections, updated_at = NOW()
       RETURNING updated_at`,
      [pageId, serialized],
    );

    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, sections, updatedAt: result.rows[0]?.updated_at ?? new Date() });
  });

  app.get("/api/cms/admin/globals", async (_request, response) => {
    const result = await pool.query<{ content_key: string; content: Record<string, string> }>(
      "SELECT content_key, content FROM public.cms_globals WHERE content_key = ANY($1::text[])",
      [[...globalKeys]],
    );
    const saved = new Map(result.rows.map((row) => [row.content_key, row.content]));
    response.setHeader("Cache-Control", "no-store");
    response.json({
      globals: {
        navbar: saved.get("navbar") ?? {},
        footer: saved.get("footer") ?? {},
      },
    });
  });

  app.put("/api/cms/admin/globals/:key", async (request, response) => {
    const key = request.params["key"] ?? "";
    if (!globalKeys.includes(key as (typeof globalKeys)[number])) {
      response.status(404).json({ error: "CMS setting not found." });
      return;
    }

    const parsed = z.object({ content: cmsGlobalSchema }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "The shared content is invalid." });
      return;
    }

    const serialized = JSON.stringify(parsed.data.content);
    if (Buffer.byteLength(serialized, "utf8") > 100_000) {
      response.status(413).json({ error: "This shared content is too large to save." });
      return;
    }

    await pool.query(
      `INSERT INTO public.cms_globals (content_key, content, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (content_key) DO UPDATE
       SET content = EXCLUDED.content, updated_at = NOW()`,
      [key, serialized],
    );

    response.setHeader("Cache-Control", "no-store");
    response.json({ ok: true, content: parsed.data.content });
  });
}

function createAdminGuard() {
  return async (request: Request, response: Response, next: NextFunction) => {
    const session = getAdminSession(request);
    if (!session) {
      response.status(401).json({ error: "Sign in to manage site content." });
      return;
    }

    next();
  };
}
