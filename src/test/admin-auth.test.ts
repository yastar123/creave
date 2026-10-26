import { createHmac } from "node:crypto";
import express, { type Request } from "express";
import { createServer, type Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAdminSession, registerAuthRoutes } from "../../server/auth";

const originalAdminEmail = process.env["CMS_ADMIN_EMAIL"];
const originalSessionSecret = process.env["SESSION_SECRET"];
const sessionSecret = "test-only-session-secret-with-enough-entropy";

function makeToken(
  claimOverrides: Partial<{
    sub: string;
    email: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
  }> = {},
) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin@example.com",
      email: "admin@example.com",
      iat: now,
      exp: now + 300,
      iss: "crevora-admin",
      aud: "crevora-cms",
      ...claimOverrides,
    }),
  ).toString("base64url");
  const signed = `${header}.${payload}`;
  const signature = createHmac("sha256", sessionSecret).update(signed).digest("base64url");
  return `${signed}.${signature}`;
}

function requestWithCookie(cookie: string): Request {
  return { headers: { cookie } } as Request;
}

describe("CMS admin JWT sessions", () => {
  beforeEach(() => {
    process.env["CMS_ADMIN_EMAIL"] = "admin@example.com";
    process.env["SESSION_SECRET"] = sessionSecret;
  });

  afterEach(() => {
    if (originalAdminEmail === undefined) delete process.env["CMS_ADMIN_EMAIL"];
    else process.env["CMS_ADMIN_EMAIL"] = originalAdminEmail;
    if (originalSessionSecret === undefined) delete process.env["SESSION_SECRET"];
    else process.env["SESSION_SECRET"] = originalSessionSecret;
  });

  it("accepts a valid, signed session for the configured admin", () => {
    const session = getAdminSession(requestWithCookie(`crevora_admin_session=${makeToken()}`));
    expect(session?.email).toBe("admin@example.com");
  });

  it("rejects expired, wrong-admin, and malformed sessions", () => {
    const expired = makeToken({ exp: Math.floor(Date.now() / 1000) - 1 });
    const wrongAdmin = makeToken({ email: "other@example.com", sub: "other@example.com" });
    expect(getAdminSession(requestWithCookie(`crevora_admin_session=${expired}`))).toBeNull();
    expect(getAdminSession(requestWithCookie(`crevora_admin_session=${wrongAdmin}`))).toBeNull();
    expect(getAdminSession(requestWithCookie("crevora_admin_session=%"))).toBeNull();
  });

  it("rejects a token whose signature has been changed", () => {
    const token = makeToken();
    const altered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    expect(getAdminSession(requestWithCookie(`crevora_admin_session=${altered}`))).toBeNull();
  });
});

describe("CMS admin login API", () => {
  let server: Server;
  let origin: string;
  const originalPassword = process.env["CMS_ADMIN_PASSWORD"];

  beforeEach(async () => {
    process.env["CMS_ADMIN_EMAIL"] = "admin@example.com";
    process.env["CMS_ADMIN_PASSWORD"] = "test-only-admin-password";
    process.env["SESSION_SECRET"] = sessionSecret;
    const app = express();
    app.use(express.json());
    registerAuthRoutes(app);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start.");
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
    if (originalPassword === undefined) delete process.env["CMS_ADMIN_PASSWORD"];
    else process.env["CMS_ADMIN_PASSWORD"] = originalPassword;
  });

  it("issues an HTTP-only JWT cookie for the right credentials and clears it on logout", async () => {
    const wrongLogin = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "wrong-password" }),
    });
    expect(wrongLogin.status).toBe(401);

    const login = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ADMIN@example.com", password: "test-only-admin-password" }),
    });
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/");

    const session = await fetch(`${origin}/api/auth/session`, {
      headers: { Cookie: cookie?.split(";")[0] ?? "" },
    });
    expect(await session.json()).toEqual({ authenticated: true, email: "admin@example.com" });

    const logout = await fetch(`${origin}/api/auth/logout`, { method: "POST" });
    expect(logout.status).toBe(200);
    expect(logout.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects requests when the administrator credentials are not configured", async () => {
    delete process.env["CMS_ADMIN_EMAIL"];
    const response = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "some-password" }),
    });
    expect(response.status).toBe(503);
  });
});
