import type { Express, NextFunction, Request, Response } from "express";
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
    const page = cmsPages.find((item) => item.id === request.params["pageId"]);
    if (!page) {
      response.status(404).json({ error: "CMS page not found." });
      return;
    }

    const result = await pool.query<{ sections: CmsSection[] }>(
      "SELECT sections FROM public.cms_pages WHERE page_id = $1",
      [page.id],
    );
    response.setHeader("Cache-Control", "no-store");
    response.json({ page, sections: result.rows[0]?.sections ?? [] });
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
    const result = await pool.query<{ page_id: string; sections: CmsSection[]; updated_at: Date | null }>(
      "SELECT page_id, sections, updated_at FROM public.cms_pages",
    );
    const saved = new Map(result.rows.map((row) => [row.page_id, row]));

    response.setHeader("Cache-Control", "no-store");
    response.json({
      pages: cmsPages.map((page) => ({
        ...page,
        sections: saved.get(page.id)?.sections ?? [],
        updatedAt: saved.get(page.id)?.updated_at ?? null,
      })),
    });
  });

  app.put("/api/cms/admin/pages/:pageId", async (request, response) => {
    const pageId = request.params["pageId"] ?? "";
    if (!cmsPageIds.has(pageId)) {
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
