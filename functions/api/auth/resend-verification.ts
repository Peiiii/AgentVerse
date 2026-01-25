import type { Env } from "../../_types";
import { generateToken, hashToken } from "../../_lib/crypto";
import { parseJson, json, errorResponse } from "../../_lib/http";
import { normalizeEmail, isValidEmail } from "../../_lib/validators";
import { sendVerificationEmail } from "../../_lib/email";

interface ResendPayload {
  email?: string;
}

const RESEND_COOLDOWN_MS = 60 * 1000;

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const body = await parseJson<ResendPayload>(request);
  if (!body || typeof body.email !== "string") {
    return errorResponse(400, "请求参数不完整", "invalid_payload");
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return errorResponse(400, "邮箱格式不正确", "invalid_email");
  }

  const user = await env.DB.prepare("SELECT id, email_verified_at FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; email_verified_at: number | null }>();

  if (!user || user.email_verified_at) {
    return json({ ok: true });
  }

  const now = Date.now();
  const lastToken = await env.DB.prepare(
    "SELECT created_at FROM email_verification_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(user.id)
    .first<{ created_at: number }>();

  if (lastToken && now - lastToken.created_at < RESEND_COOLDOWN_MS) {
    return errorResponse(429, "请求过于频繁，请稍后再试", "rate_limited");
  }

  const token = generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = now + 24 * 60 * 60 * 1000;

  await env.DB.prepare(
    `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(crypto.randomUUID(), user.id, tokenHash, expiresAt, now)
    .run();

  try {
    await sendVerificationEmail(request, env, email, token);
  } catch {
    return errorResponse(500, "发送验证邮件失败", "email_send_failed");
  }

  return json({ ok: true });
};
