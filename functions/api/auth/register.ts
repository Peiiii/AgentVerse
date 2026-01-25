import type { Env } from "../../_types";
import { hashPassword, generateToken, hashToken } from "../../_lib/crypto";
import { parseJson, json, errorResponse } from "../../_lib/http";
import { normalizeEmail, isValidEmail, isValidPassword } from "../../_lib/validators";
import { sendVerificationEmail } from "../../_lib/email";

interface RegisterPayload {
  email?: string;
  password?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const body = await parseJson<RegisterPayload>(request);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return errorResponse(400, "请求参数不完整", "invalid_payload");
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return errorResponse(400, "邮箱格式不正确", "invalid_email");
  }
  if (!isValidPassword(body.password)) {
    return errorResponse(400, "密码长度不足", "password_too_short");
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();
  if (existing) {
    return errorResponse(409, "邮箱已注册", "email_exists");
  }

  const now = Date.now();
  const userId = crypto.randomUUID();
  const { hash, salt } = await hashPassword(body.password);

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, password_salt, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(userId, email, hash, salt, now, now)
    .run();

  const token = generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = now + 24 * 60 * 60 * 1000;
  await env.DB.prepare(
    `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(crypto.randomUUID(), userId, tokenHash, expiresAt, now)
    .run();

  try {
    await sendVerificationEmail(request, env, email, token);
  } catch {
    return errorResponse(500, "发送验证邮件失败", "email_send_failed");
  }

  return json({ ok: true });
};
