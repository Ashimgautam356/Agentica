import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Response } from "express";
import { ApiError } from "../errors/api-error";

const cookieName = "agentica_admin_token";
const tokenTtlSeconds = 60 * 60 * 24 * 7;
const isProduction = process.env.NODE_ENV === "production";

type AdminRole = "ADMIN" | "SUPER_ADMIN";

type AuthTokenPayload = {
  sub: string;
  role: AdminRole;
  exp: number;
};

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function authSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError("INTERNAL_SERVER_ERROR", "JWT_SECRET is required.");
  }

  return secret;
}

function sign(data: string) {
  return createHmac("sha256", authSecret()).update(data).digest("base64url");
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createAuthToken(user: { id: string; role: AdminRole }) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + tokenTtlSeconds,
    } satisfies AuthTokenPayload),
  );
  const unsigned = `${header}.${payload}`;

  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const [header, payload, signature] = token.split(".");
  const unsigned = `${header}.${payload}`;

  if (!header || !payload || !signature || !secureEqual(signature, sign(unsigned))) {
    throw new ApiError("UNAUTHORIZED");
  }

  let parsed: Partial<AuthTokenPayload>;

  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as Partial<AuthTokenPayload>;
  } catch {
    throw new ApiError("UNAUTHORIZED");
  }

  if (
    !parsed.sub ||
    (parsed.role !== "ADMIN" && parsed.role !== "SUPER_ADMIN") ||
    !parsed.exp ||
    parsed.exp < Math.floor(Date.now() / 1000)
  ) {
    throw new ApiError("SESSION_EXPIRED");
  }

  return parsed as AuthTokenPayload;
}

export function authCookie(token: string, response: Response) {
  response.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: tokenTtlSeconds * 1000,
    path: "/",
  });
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

export function readAuthCookie(cookieHeader?: string) {
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([name]) => name === cookieName)?.[1];
}
