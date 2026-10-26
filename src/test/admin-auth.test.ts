import { createHmac } from "node:crypto";
import type { Request } from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAdminSession } from "../../server/auth";

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
