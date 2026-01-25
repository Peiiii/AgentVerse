import type { Env } from "../_types";
import { hashToken, generateToken } from "./crypto";

const COOKIE_NAME = "av_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === COOKIE_NAME) {
      return decodeURIComponent(value || "");
    }
  }
  return null;
}

function serializeCookie(value: string, maxAgeSeconds: number, secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function buildSessionCookie(token: string, request: Request): string {
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  const secure = new URL(request.url).protocol === "https:";
  return serializeCookie(token, maxAgeSeconds, secure);
}

export function buildClearSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:";
  return serializeCookie("", 0, secure);
}

export async function createSession(env: Env, userId: string): Promise<string> {
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(crypto.randomUUID(), userId, tokenHash, now + SESSION_TTL_MS, now, now)
    .run();
  return token;
}

export async function deleteSession(env: Env, token: string): Promise<void> {
  const tokenHash = await hashToken(token);
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export async function getSessionUser(
  env: Env,
  token: string
): Promise<{ id: string; email: string; email_verified_at: number | null } | null> {
  const tokenHash = await hashToken(token);
  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT users.id, users.email, users.email_verified_at, sessions.id as session_id, sessions.expires_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ?`
  )
    .bind(tokenHash)
    .first<{
      id: string;
      email: string;
      email_verified_at: number | null;
      session_id: string;
      expires_at: number;
    }>();

  if (!row) {
    return null;
  }
  if (row.expires_at <= now) {
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(row.session_id).run();
    return null;
  }
  await env.DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?")
    .bind(now, row.session_id)
    .run();
  return { id: row.id, email: row.email, email_verified_at: row.email_verified_at };
}
