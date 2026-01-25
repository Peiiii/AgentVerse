import type { Env } from "../../_types";
import { parseJson, json, errorResponse } from "../../_lib/http";
import { hashToken } from "../../_lib/crypto";
import { buildSessionCookie, createSession } from "../../_lib/sessions";

interface VerifyPayload {
  token?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const body = await parseJson<VerifyPayload>(request);
  if (!body || typeof body.token !== "string") {
    return errorResponse(400, "请求参数不完整", "invalid_payload");
  }

  const tokenHash = await hashToken(body.token);
  const tokenRow = await env.DB.prepare(
    `SELECT id, user_id, expires_at, used_at
     FROM email_verification_tokens
     WHERE token_hash = ?`
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string; expires_at: number; used_at: number | null }>();

  if (!tokenRow) {
    return errorResponse(400, "验证链接已失效", "invalid_token");
  }
  if (tokenRow.used_at) {
    return errorResponse(400, "验证链接已失效", "invalid_token");
  }
  const now = Date.now();
  if (tokenRow.expires_at <= now) {
    return errorResponse(400, "验证链接已过期", "token_expired");
  }

  await env.DB.prepare("UPDATE email_verification_tokens SET used_at = ? WHERE id = ?")
    .bind(now, tokenRow.id)
    .run();
  await env.DB.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?")
    .bind(now, now, tokenRow.user_id)
    .run();

  const sessionToken = await createSession(env, tokenRow.user_id);
  const cookie = buildSessionCookie(sessionToken, request);

  const user = await env.DB.prepare(
    "SELECT id, email, email_verified_at FROM users WHERE id = ?"
  )
    .bind(tokenRow.user_id)
    .first<{ id: string; email: string; email_verified_at: number | null }>();

  if (!user) {
    return errorResponse(400, "验证失败", "user_not_found");
  }

  return json(
    {
      ok: true,
      user: { id: user.id, email: user.email, emailVerified: Boolean(user.email_verified_at) },
    },
    {
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
};
