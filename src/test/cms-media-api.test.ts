import { createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import express from "express";
import { createServer, type Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { registerCmsMediaRoutes } from "../../server/media";

const testAdminEmail = "media-admin@example.test";
const testSessionSecret = "test-only-cms-media-session-secret";
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
  const content = `${header}.${payload}`;
  const signature = createHmac("sha256", testSessionSecret).update(content).digest("base64url");
  return `crevora_admin_session=${content}.${signature}`;
}

function multipartBody(filename: string, mimeType: string, contents: Buffer) {
  const boundary = "crevora-cms-media-test-boundary";
  return {
    boundary,
    body: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
      ),
      contents,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
}

describe("CMS media library API", () => {
  let server: Server;
  let origin: string;
  let mediaDirectory: string;

  beforeEach(async () => {
    process.env["CMS_ADMIN_EMAIL"] = testAdminEmail;
    process.env["SESSION_SECRET"] = testSessionSecret;
    mediaDirectory = await mkdtemp(path.join(tmpdir(), "crevora-cms-media-"));

    const app = express();
    registerCmsMediaRoutes(app, mediaDirectory);
    app.use("/uploads", express.static(mediaDirectory));
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("The media test server did not start.");
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await rm(mediaDirectory, { recursive: true, force: true });
    if (originalAdminEmail === undefined) delete process.env["CMS_ADMIN_EMAIL"];
    else process.env["CMS_ADMIN_EMAIL"] = originalAdminEmail;
    if (originalSessionSecret === undefined) delete process.env["SESSION_SECRET"];
    else process.env["SESSION_SECRET"] = originalSessionSecret;
  });

  it("requires an admin session and serves uploaded images from the media library", async () => {
    const denied = await fetch(`${origin}/api/cms/admin/media`);
    expect(denied.status).toBe(401);

    const headers = { Cookie: makeAdminCookie() };
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2d8AAAAASUVORK5CYII=",
      "base64",
    );
    const form = multipartBody("brand-mark.png", "image/png", png);
    const upload = await fetch(`${origin}/api/cms/admin/media`, {
      method: "POST",
      headers: { ...headers, "Content-Type": `multipart/form-data; boundary=${form.boundary}` },
      body: form.body,
    });

    const uploadResult = await upload.json();
    expect(upload.status, JSON.stringify(uploadResult)).toBe(201);
    const { asset } = uploadResult as { asset: { url: string; mimeType: string } };
    expect(asset.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/);
    expect(asset.mimeType).toBe("image/png");

    const publicFile = await fetch(new URL(asset.url, origin));
    expect(publicFile.status).toBe(200);
    expect(publicFile.headers.get("content-type")).toContain("image/png");

    const library = await fetch(`${origin}/api/cms/admin/media`, { headers });
    expect((await library.json()).assets).toHaveLength(1);
  });

  it("uploads supported WebM videos and serves them from the media library", async () => {
    const webm = Buffer.from(
      "1a45dfa39f4286810142f7810142f2810442f381084282847765626d4287810242858102",
      "hex",
    );
    const form = multipartBody("showreel.webm", "video/webm", webm);
    const upload = await fetch(`${origin}/api/cms/admin/media`, {
      method: "POST",
      headers: {
        Cookie: makeAdminCookie(),
        "Content-Type": `multipart/form-data; boundary=${form.boundary}`,
      },
      body: form.body,
    });

    const uploadResult = await upload.json();
    expect(upload.status, JSON.stringify(uploadResult)).toBe(201);
    const { asset } = uploadResult as { asset: { url: string; mimeType: string } };
    expect(asset.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.webm$/);
    expect(asset.mimeType).toBe("video/webm");

    const publicFile = await fetch(new URL(asset.url, origin));
    expect(publicFile.status).toBe(200);
    expect(publicFile.headers.get("content-type")).toContain("video/webm");
    expect(Buffer.from(await publicFile.arrayBuffer())).toEqual(webm);

    const library = await fetch(`${origin}/api/cms/admin/media`, {
      headers: { Cookie: makeAdminCookie() },
    });
    expect((await library.json()).assets).toHaveLength(1);
  });

  it("rejects file contents that do not match a supported media format", async () => {
    const form = multipartBody("fake.png", "image/png", Buffer.from("not an image"));
    const response = await fetch(`${origin}/api/cms/admin/media`, {
      method: "POST",
      headers: {
        Cookie: makeAdminCookie(),
        "Content-Type": `multipart/form-data; boundary=${form.boundary}`,
      },
      body: form.body,
    });

    const result = await response.json();
    expect(response.status, JSON.stringify(result)).toBe(415);
    expect(result.error).toMatch(/file contents/i);
  });
});
