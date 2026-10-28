import { createHmac } from "node:crypto";
import express from "express";
import { createServer, type Server } from "node:http";
import type { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { registerCmsRoutes } from "../../server/cms";

const testAdminEmail = "cms-admin@example.test";
const testSessionSecret = "test-only-cms-api-session-secret";
const originalAdminEmail = process.env["ADMIN_EMAIL"];
const originalLegacyAdminEmail = process.env["CMS_ADMIN_EMAIL"];
const originalSessionSecret = process.env["SESSION_SECRET"];

type PageRow = {
  page_id: string;
  title: string;
  route: string;
  is_custom: boolean;
  sections: Array<Record<string, unknown>>;
  updated_at: Date | null;
};

type InquiryRow = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  interest: string;
  message: string;
  whatsappOk: boolean;
  createdAt: Date;
};

function makeAdminCookie() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: testAdminEmail,
    email: testAdminEmail,
    iat: now,
    exp: now + 300,
    iss: "crevora-admin",
    aud: "crevora-cms",
  })).toString("base64url");
  const content = `${header}.${payload}`;
  const signature = createHmac("sha256", testSessionSecret).update(content).digest("base64url");
  return `crevora_admin_session=${content}.${signature}`;
}

function createFakePool() {
  const now = new Date("2026-10-20T10:00:00.000Z");
  const pages: PageRow[] = [
    { page_id: "home", title: "Home", route: "/", is_custom: false, sections: [], updated_at: now },
  ];
  const globals = new Map<string, Record<string, string>>([
    ["navbar", { logo: "CREVORA" }],
  ]);
  const inquiries: InquiryRow[] = [
    {
      id: "1",
      name: "Ada Lovelace",
      company: "Analytical Engines",
      email: "ada@example.test",
      phone: "+264 81 123 4567",
      interest: "Brand identity",
      message: "Please share a project proposal.",
      whatsappOk: true,
      createdAt: now,
    },
    {
      id: "2",
      name: "Grace Hopper",
      company: "Studio North",
      email: "grace@example.test",
      phone: "+264 81 765 4321",
      interest: "Brand strategy",
      message: "We would like to discuss a project.",
      whatsappOk: false,
      createdAt: new Date(now.getTime() - 1000),
    },
    {
      id: "3",
      name: "Katherine Johnson",
      company: null,
      email: "katherine@example.test",
      phone: "+264 81 111 2222",
      interest: "Web design",
      message: "We need a new site.",
      whatsappOk: false,
      createdAt: new Date(now.getTime() - 2000),
    },
  ];

  const pool = {
    async query(sql: string, values: unknown[] = []) {
      if (sql.includes("WHERE page_id = $1 OR ($2::text IS NOT NULL AND route = $2)")) {
        const pageId = String(values[0] ?? "");
        const route = values[1] === null ? null : String(values[1] ?? "");
        const row = pages.find((page) => page.page_id === pageId || (route !== null && page.route === route));
        return { rows: row ? [{ ...row }] : [] };
      }

      if (sql.includes("SELECT page_id, title, route, is_custom, sections, updated_at FROM public.cms_pages")) {
        return { rows: pages.map((page) => ({ ...page })) };
      }

      if (sql.includes("SELECT page_id FROM public.cms_pages WHERE page_id = $1")) {
        return { rows: pages.some((page) => page.page_id === values[0]) ? [{ page_id: values[0] }] : [] };
      }

      if (sql.includes("INSERT INTO public.cms_pages (page_id, title, route, is_custom, sections, updated_at)")) {
        const [, title, route] = values as [string, string, string];
        if (pages.some((page) => page.route === route)) {
          throw Object.assign(new Error("Duplicate route."), { code: "23505" });
        }
        const row: PageRow = {
          page_id: String(values[0]),
          title,
          route,
          is_custom: true,
          sections: [],
          updated_at: now,
        };
        pages.push(row);
        return { rows: [{ ...row }] };
      }

      if (sql.includes("UPDATE public.cms_pages")) {
        const [pageId, title, route] = values as [string, string, string];
        const page = pages.find((item) => item.page_id === pageId && item.is_custom);
        if (!page) return { rows: [] };
        if (pages.some((item) => item.page_id !== pageId && item.route === route)) {
          throw Object.assign(new Error("Duplicate route."), { code: "23505" });
        }
        page.title = title;
        page.route = route;
        page.updated_at = now;
        return { rows: [{ page_id: pageId, title, route }] };
      }

      if (sql.includes("DELETE FROM public.cms_pages")) {
        const pageId = String(values[0] ?? "");
        const index = pages.findIndex((page) => page.page_id === pageId && page.is_custom);
        if (index < 0) return { rows: [] };
        pages.splice(index, 1);
        return { rows: [{ page_id: pageId }] };
      }

      if (sql.includes("INSERT INTO public.cms_pages (page_id, sections, updated_at)")) {
        const pageId = String(values[0] ?? "");
        const page = pages.find((item) => item.page_id === pageId);
        const sections = JSON.parse(String(values[1] ?? "[]")) as PageRow["sections"];
        if (page) {
          page.sections = sections;
          page.updated_at = now;
        } else {
          pages.push({
            page_id: pageId,
            title: "",
            route: "",
            is_custom: false,
            sections,
            updated_at: now,
          });
        }
        return { rows: [{ updated_at: now }] };
      }

      if (sql.includes("SELECT content_key, content FROM public.cms_globals")) {
        const keys = values[0] as string[];
        return {
          rows: keys.flatMap((key) => {
            const content = globals.get(key);
            return content ? [{ content_key: key, content }] : [];
          }),
        };
      }

      if (sql.includes("INSERT INTO public.cms_globals")) {
        const key = String(values[0] ?? "");
        globals.set(key, JSON.parse(String(values[1] ?? "{}")) as Record<string, string>);
        return { rows: [] };
      }

      if (sql.includes("SELECT COUNT(*)::text AS total")) {
        const search = String(values[0] ?? "").toLowerCase();
        const matching = inquiries.filter((inquiry) =>
          !search || [inquiry.name, inquiry.company, inquiry.email, inquiry.interest, inquiry.message]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(search)),
        );
        return { rows: [{ total: String(matching.length) }] };
      }

      if (sql.includes("SELECT id, name, company, email, phone, interest, message")) {
        const hasSearch = sql.includes("LIMIT $2 OFFSET $3");
        const search = hasSearch ? String(values[0] ?? "").toLowerCase() : "";
        const pageSize = Number(values[hasSearch ? 1 : 0] ?? 20);
        const offset = Number(values[hasSearch ? 2 : 1] ?? 0);
        const matching = inquiries.filter((inquiry) =>
          !search || [inquiry.name, inquiry.company, inquiry.email, inquiry.interest, inquiry.message]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(search)),
        );
        return { rows: matching.slice(offset, offset + pageSize) };
      }

      return { rows: [] };
    },
  };

  return pool as unknown as Pool;
}

describe("CMS admin page, shared-content, and inbox APIs", () => {
  let server: Server;
  let origin: string;
  const adminHeaders = {
    Cookie: makeAdminCookie(),
    "Content-Type": "application/json",
  };

  beforeEach(async () => {
    process.env["ADMIN_EMAIL"] = testAdminEmail;
    delete process.env["CMS_ADMIN_EMAIL"];
    process.env["SESSION_SECRET"] = testSessionSecret;

    const app = express();
    app.use(express.json());
    registerCmsRoutes(app, createFakePool());
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("The CMS admin API test server did not start.");
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    if (originalAdminEmail === undefined) delete process.env["ADMIN_EMAIL"];
    else process.env["ADMIN_EMAIL"] = originalAdminEmail;
    if (originalLegacyAdminEmail === undefined) delete process.env["CMS_ADMIN_EMAIL"];
    else process.env["CMS_ADMIN_EMAIL"] = originalLegacyAdminEmail;
    if (originalSessionSecret === undefined) delete process.env["SESSION_SECRET"];
    else process.env["SESSION_SECRET"] = originalSessionSecret;
  });

  it("protects page CRUD, validates changes, and serves saved custom pages", async () => {
    const denied = await fetch(`${origin}/api/cms/admin/pages`);
    expect(denied.status).toBe(401);

    const list = await fetch(`${origin}/api/cms/admin/pages`, { headers: adminHeaders });
    expect(list.status).toBe(200);
    expect((await list.json()).pages.some((page: { id: string }) => page.id === "home")).toBe(true);

    const invalid = await fetch(`${origin}/api/cms/admin/pages`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ title: "Our Approach", slug: "Not valid" }),
    });
    expect(invalid.status).toBe(400);

    const create = await fetch(`${origin}/api/cms/admin/pages`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ title: "Our Approach", slug: "our-approach" }),
    });
    expect(create.status).toBe(201);
    const created = (await create.json()).page as { id: string; route: string };
    expect(created.route).toBe("/pages/our-approach");

    const duplicate = await fetch(`${origin}/api/cms/admin/pages`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ title: "Duplicate", slug: "our-approach" }),
    });
    expect(duplicate.status).toBe(409);

    const rename = await fetch(`${origin}/api/cms/admin/pages/${created.id}`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ title: "Our Method", slug: "our-method" }),
    });
    expect(rename.status).toBe(200);
    expect((await rename.json()).page.route).toBe("/pages/our-method");

    const section = {
      id: "intro",
      type: "text",
      title: "Introduction",
      enabled: true,
      fields: { body: "A custom page section." },
    };
    const saveSections = await fetch(`${origin}/api/cms/admin/pages/${created.id}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ sections: [section] }),
    });
    expect(saveSections.status).toBe(200);

    const duplicateSections = await fetch(`${origin}/api/cms/admin/pages/${created.id}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ sections: [section, section] }),
    });
    expect(duplicateSections.status).toBe(400);

    const publicPage = await fetch(`${origin}/api/cms/public/custom-route-our-method`);
    expect(publicPage.status).toBe(200);
    expect((await publicPage.json()).sections).toEqual([section]);

    const remove = await fetch(`${origin}/api/cms/admin/pages/${created.id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    expect(remove.status).toBe(200);
    const removeAgain = await fetch(`${origin}/api/cms/admin/pages/${created.id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    expect(removeAgain.status).toBe(404);
    const removeBuiltIn = await fetch(`${origin}/api/cms/admin/pages/home`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    expect(removeBuiltIn.status).toBe(404);
    const missingPage = await fetch(`${origin}/api/cms/public/not-a-page`);
    expect(missingPage.status).toBe(404);
  });

  it("reads and saves navigation and footer content with validation", async () => {
    const read = await fetch(`${origin}/api/cms/admin/globals`, { headers: adminHeaders });
    expect(read.status).toBe(200);
    expect((await read.json()).globals).toEqual({
      navbar: { logo: "CREVORA" },
      footer: {},
    });

    const save = await fetch(`${origin}/api/cms/admin/globals/navbar`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ content: { logo: "CREVORA Studio", contact: "/contact" } }),
    });
    expect(save.status).toBe(200);

    const publicRead = await fetch(`${origin}/api/cms/public-globals`);
    expect(publicRead.status).toBe(200);
    expect((await publicRead.json()).globals.navbar).toEqual({
      logo: "CREVORA Studio",
      contact: "/contact",
    });

    const invalidContent = await fetch(`${origin}/api/cms/admin/globals/footer`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ content: { copyright: 2026 } }),
    });
    expect(invalidContent.status).toBe(400);

    const invalidKey = await fetch(`${origin}/api/cms/admin/globals/sidebar`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ content: {} }),
    });
    expect(invalidKey.status).toBe(404);

    const denied = await fetch(`${origin}/api/cms/admin/globals`);
    expect(denied.status).toBe(401);
  });

  it("searches, paginates, and validates contact inquiries", async () => {
    const denied = await fetch(`${origin}/api/cms/admin/inquiries`);
    expect(denied.status).toBe(401);

    const firstPage = await fetch(
      `${origin}/api/cms/admin/inquiries?page=1&pageSize=1&search=BRAND`,
      { headers: adminHeaders },
    );
    expect(firstPage.status).toBe(200);
    const first = await firstPage.json();
    expect(first.total).toBe(2);
    expect(first.inquiries).toHaveLength(1);
    expect(first.inquiries[0].name).toBe("Ada Lovelace");

    const secondPage = await fetch(
      `${origin}/api/cms/admin/inquiries?page=2&pageSize=1&search=brand`,
      { headers: adminHeaders },
    );
    expect((await secondPage.json()).inquiries[0].name).toBe("Grace Hopper");

    const invalidPage = await fetch(`${origin}/api/cms/admin/inquiries?page=0`, {
      headers: adminHeaders,
    });
    expect(invalidPage.status).toBe(400);
  });
});
