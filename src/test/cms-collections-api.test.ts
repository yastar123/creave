import { createHmac } from "node:crypto";
import express from "express";
import { createServer, type Server } from "node:http";
import type { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { defaultSiteContent } from "@/lib/studio-content";
import type { SiteContent } from "@/lib/site-content-shared";
import { initializeSiteContent, registerCmsRoutes } from "../../server/cms";

const testAdminEmail = "admin@example.test";
const testSessionSecret = "test-only-cms-collection-session-secret";
const originalAdminEmail = process.env["CMS_ADMIN_EMAIL"];
const originalSessionSecret = process.env["SESSION_SECRET"];

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
  const signingContent = `${header}.${payload}`;
  const signature = createHmac("sha256", testSessionSecret).update(signingContent).digest("base64url");
  return `crevora_admin_session=${signingContent}.${signature}`;
}

describe("CMS collection API", () => {
  let server: Server;
  let origin: string;
  let storedContent: SiteContent;

  beforeEach(async () => {
    process.env["CMS_ADMIN_EMAIL"] = testAdminEmail;
    process.env["SESSION_SECRET"] = testSessionSecret;
    storedContent = JSON.parse(JSON.stringify(defaultSiteContent)) as SiteContent;

    const fakePool = {
      query: async (sql: string, values?: unknown[]) => {
        if (sql.includes("SELECT collection_key, items")) {
          return {
            rows: Object.entries(storedContent).map(([collection_key, items]) => ({
              collection_key,
              items,
            })),
          };
        }
        if (sql.includes("INSERT INTO public.cms_content_collections")) {
          const key = String(values?.[0] ?? "");
          const items = JSON.parse(String(values?.[1] ?? "[]")) as unknown[];
          storedContent = { ...storedContent, [key]: items } as SiteContent;
          return { rows: [] };
        }
        return { rows: [] };
      },
    } as unknown as Pool;

    const app = express();
    app.use(express.json());
    registerCmsRoutes(app, fakePool);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("The CMS test server did not start.");
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    if (originalAdminEmail === undefined) delete process.env["CMS_ADMIN_EMAIL"];
    else process.env["CMS_ADMIN_EMAIL"] = originalAdminEmail;
    if (originalSessionSecret === undefined) delete process.env["SESSION_SECRET"];
    else process.env["SESSION_SECRET"] = originalSessionSecret;
  });

  it("protects admin reads and saves valid collection changes in PostgreSQL", async () => {
    const denied = await fetch(`${origin}/api/cms/admin/collections`);
    expect(denied.status).toBe(401);

    const headers = { Cookie: makeAdminCookie(), "Content-Type": "application/json" };
    const read = await fetch(`${origin}/api/cms/admin/collections`, { headers });
    expect(read.status).toBe(200);
    const initial = await read.json() as { content: SiteContent };
    expect(initial.content.articles).toHaveLength(defaultSiteContent.articles.length);

    const nextServices = defaultSiteContent.services.slice(0, -1).map((service, index) =>
      index === 0 ? { ...service, menuNote: "Saved from the admin API" } : service,
    );
    const saved = await fetch(`${origin}/api/cms/admin/collections/services`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ items: nextServices }),
    });
    expect(saved.status).toBe(200);
    expect(storedContent.services).toHaveLength(defaultSiteContent.services.length - 1);
    expect(storedContent.services[0]?.menuNote).toBe("Saved from the admin API");
  });

  it("rejects invalid records and duplicate identifiers", async () => {
    const headers = { Cookie: makeAdminCookie(), "Content-Type": "application/json" };
    const invalid = await fetch(`${origin}/api/cms/admin/collections/articles`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ items: [{ slug: "bad article" }] }),
    });
    expect(invalid.status).toBe(400);

    const duplicateServices = [
      defaultSiteContent.services[0],
      { ...defaultSiteContent.services[1], to: defaultSiteContent.services[0]?.to },
    ];
    const duplicate = await fetch(`${origin}/api/cms/admin/collections/services`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ items: duplicateServices }),
    });
    expect(duplicate.status).toBe(400);
    expect(storedContent.services).toHaveLength(defaultSiteContent.services.length);
  });

  it("seeds only missing content keys and preserves admin edits", async () => {
    const seeded = JSON.parse(JSON.stringify(defaultSiteContent)) as SiteContent;
    seeded.services[0] = { ...seeded.services[0]!, menuNote: "Existing admin edit" };
    const pool = {
      query: async (sql: string, values?: unknown[]) => {
        if (sql.includes("INSERT INTO public.cms_content_collections")) {
          const key = String(values?.[0] ?? "") as keyof SiteContent;
          if (!seeded[key]) seeded[key] = JSON.parse(String(values?.[1] ?? "[]")) as never;
          return { rows: [] };
        }
        return { rows: [] };
      },
    } as unknown as Pool;

    await initializeSiteContent(pool, defaultSiteContent);
    expect(seeded.services[0]?.menuNote).toBe("Existing admin edit");
  });
});
