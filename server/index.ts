import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import express from "express";
import { rateLimit } from "express-rate-limit";
import { Pool } from "pg";
import * as z from "zod";
import type { ViteDevServer } from "vite";
import type { RenderedPage } from "../src/entry-server";
import { registerCmsRoutes } from "./cms";
import { registerAuthRoutes } from "./auth";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDirectory = path.join(projectRoot, "dist", "client");
const isProduction = process.env["NODE_ENV"] === "production";
const port = Number(process.env["PORT"] ?? 5000);

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL is required to start the Express server.");
}

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const app = express();
const httpServer = createHttpServer(app);
let viteServerForShutdown: ViteDevServer | undefined;
let productionRenderer: Promise<{ renderPage: (url: string) => Promise<RenderedPage> }> | undefined;

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "12kb" }));

registerAuthRoutes(app);
registerCmsRoutes(app, pool);

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).default(""),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20).regex(/^[+0-9()\s-]+$/),
  interest: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(1000),
  whatsappOk: z.boolean(),
  privacyConsent: z.boolean().refine((value) => value, "Privacy consent is required."),
  honeypot: z.string().max(200).default(""),
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many enquiries. Please wait a little and try again." },
});

app.get("/api/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ ok: true, database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error);
    response.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.post("/api/contact", contactLimiter, async (request, response) => {
  const result = contactSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: "Please check the submitted fields and privacy consent.",
      fieldErrors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const inquiry = result.data;

  // Quietly accept honeypot submissions without storing them.
  if (inquiry.honeypot.trim()) {
    response.status(202).json({ ok: true });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO public.contact_inquiries
        (name, company, email, phone, interest, message, whatsapp_ok, privacy_consent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        inquiry.name,
        inquiry.company || null,
        inquiry.email.toLowerCase(),
        inquiry.phone,
        inquiry.interest,
        inquiry.message,
        inquiry.whatsappOk,
      ],
    );

    response.status(201).json({ ok: true });
  } catch (error) {
    console.error("Contact enquiry could not be saved:", error);
    response.status(503).json({
      error: "We could not save your enquiry right now. Please try again shortly.",
    });
  }
});

async function startServer() {
  await pool.query("SELECT 1");

  if (isProduction) {
    app.use(express.static(clientDirectory, { index: false }));
  } else {
    const { createServer: createViteServer } = await import("vite");
    viteServerForShutdown = await createViteServer({
      configFile: path.join(projectRoot, "vite.config.ts"),
      appType: "custom",
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
    });
    app.use(viteServerForShutdown.middlewares);
  }

  app.use(async (request, response, next) => {
    if (request.method !== "GET" || request.path.startsWith("/api/")) {
      next();
      return;
    }

    try {
      const sourceHtml = await readFile(
        path.join(isProduction ? clientDirectory : projectRoot, "index.html"),
        "utf8",
      );
      const template = viteServerForShutdown
        ? await viteServerForShutdown.transformIndexHtml(request.originalUrl, sourceHtml)
        : sourceHtml;
      const page = await renderReactPage(request.originalUrl);
      const html = injectRenderedPage(template, page);
      response.status(200).type("html").send(html);
    } catch (error) {
      if (viteServerForShutdown && error instanceof Error) {
        viteServerForShutdown.ssrFixStacktrace(error);
      }
      next(error);
    }
  });

  app.use((request, response) => {
    if (request.path.startsWith("/api/")) {
      response.status(404).json({ error: "API endpoint not found." });
      return;
    }

    response.status(404).type("text").send("Page not found.");
  });

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Request failed:", error);
      response.status(500).json({ error: "An unexpected server error occurred." });
    },
  );

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`CREVORA is running on port ${port} (${isProduction ? "production" : "development"}).`);
  });
}

async function shutdown() {
  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => (error ? reject(error) : resolve()));
  });
  await pool.end();
  await viteCleanup();
}

async function viteCleanup() {
  await viteServerForShutdown?.close();
}

async function renderReactPage(url: string): Promise<RenderedPage> {
  if (viteServerForShutdown) {
    const serverEntry = await viteServerForShutdown.ssrLoadModule("/src/entry-server.tsx");
    return serverEntry["renderPage"](url) as Promise<RenderedPage>;
  }

  productionRenderer ??= import(
    pathToFileURL(path.join(projectRoot, "dist", "server", "entry-server.js")).href
  ) as Promise<{ renderPage: (url: string) => Promise<RenderedPage> }>;
  return (await productionRenderer).renderPage(url);
}

function injectRenderedPage(template: string, page: RenderedPage): string {
  const title = page.head.meta.find((entry) => entry.title)?.title;
  const titleMarkup = title ? `<title>${escapeHtml(title)}</title>` : "";
  const metaMarkup = page.head.meta
    .filter((entry) => (entry.name || entry.property) && entry.content)
    .map((entry) => {
      const attributes = [
        entry.name ? `name="${escapeHtml(entry.name)}"` : "",
        entry.property ? `property="${escapeHtml(entry.property)}"` : "",
        `content="${escapeHtml(entry.content ?? "")}"`,
        'data-route-meta="true"',
      ].filter(Boolean);
      return `<meta ${attributes.join(" ")} />`;
    })
    .join("");
  const scriptsMarkup = page.head.scripts
    .map((entry) => {
      const type = entry.type ? ` type="${escapeHtml(entry.type)}"` : "";
      const body = (entry.children ?? "").replace(/</g, "\\u003c");
      return `<script${type} data-route-meta="true">${body}</script>`;
    })
    .join("");
  const pageHtml = template.replace("<!--app-html-->", page.markup);

  return pageHtml
    .replace(/<title>[\s\S]*?<\/title>/i, titleMarkup || "<title>CREVORA — Creative with purpose</title>")
    .replace("</head>", `${metaMarkup}${scriptsMarkup}</head>`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());

startServer().catch(async (error) => {
  console.error("Express server failed to start:", error);
  await pool.end();
  process.exitCode = 1;
});
