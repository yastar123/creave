import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Express, Request } from "express";
import { rateLimit } from "express-rate-limit";
import * as z from "zod";

const scryptAsync = promisify(scrypt);
const cookieName = "crevora_admin_session";
const tokenLifetimeSeconds = 60 * 60 * 8;
const passwordSalt = "crevora-admin-password-v1";

type AdminClaims = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  iss: "crevora-admin";
  aud: "crevora-cms";
};

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Login sementara tidak tersedia. Silakan coba lagi nanti." },
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200),
});

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", loginLimiter, async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Enter a valid email address and password." });
      return;
    }

    const email = process.env["ADMIN_EMAIL"]?.trim().toLowerCase()
      || process.env["CMS_ADMIN_EMAIL"]?.trim().toLowerCase();
    const password = process.env["ADMIN_PASSWORD"] || process.env["CMS_ADMIN_PASSWORD"];
    const jwtSecret = process.env["SESSION_SECRET"];
    if (!email || !password || !jwtSecret) {
      response.status(503).json({ error: "Admin login is not configured yet." });
      return;
    }

    const candidateHash = (await scryptAsync(parsed.data.password, passwordSalt, 64)) as Buffer;
    const expectedHash = (await scryptAsync(password, passwordSalt, 64)) as Buffer;
    const passwordMatches = timingSafeEqual(candidateHash, expectedHash);
    if (parsed.data.email.trim().toLowerCase() !== email || !passwordMatches) {
      response.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const token = signToken(
      {
        sub: email,
        email,
        iat: now,
        exp: now + tokenLifetimeSeconds,
        iss: "crevora-admin",
        aud: "crevora-cms",
      },
      jwtSecret,
    );
    response.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      path: "/",
      maxAge: tokenLifetimeSeconds * 1000,
    });
    response.json({ authenticated: true, email });
  });

  app.get("/api/auth/session", (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const session = getAdminSession(request);
    if (!session) {
      response.json({ authenticated: false });
      return;
    }
    response.json({ authenticated: true, email: session.email });
  });

  app.post("/api/auth/logout", (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      path: "/",
    });
    response.json({ authenticated: false });
  });
}

export function getAdminSession(request: Request): AdminClaims | null {
  const secret = process.env["SESSION_SECRET"];
  const expectedEmail = process.env["ADMIN_EMAIL"]?.trim().toLowerCase()
    || process.env["CMS_ADMIN_EMAIL"]?.trim().toLowerCase();
  if (!secret || !expectedEmail) return null;

  const token = readCookie(request, cookieName);
  if (!token || token.length > 4096) return null;
  const [encodedHeader, encodedClaims, encodedSignature, extra] = token.split(".");
  if (!encodedHeader || !encodedClaims || !encodedSignature || extra !== undefined) return null;

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as {
      alg?: string;
      typ?: string;
    };
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const signedContent = `${encodedHeader}.${encodedClaims}`;
    const expectedSignature = createHmac("sha256", secret).update(signedContent).digest();
    const actualSignature = Buffer.from(encodedSignature, "base64url");
    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return null;
    }

    const claims = JSON.parse(
      Buffer.from(encodedClaims, "base64url").toString("utf8"),
    ) as AdminClaims;
    const now = Math.floor(Date.now() / 1000);
    if (
      claims.iss !== "crevora-admin" ||
      claims.aud !== "crevora-cms" ||
      claims.sub !== expectedEmail ||
      claims.email !== expectedEmail ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= now ||
      !Number.isInteger(claims.iat) ||
      claims.iat > now
    ) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

function signToken(claims: AdminClaims, secret: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signedContent = `${header}.${payload}`;
  const signature = createHmac("sha256", secret).update(signedContent).digest("base64url");
  return `${signedContent}.${signature}`;
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(cookie.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}
