import type { Env } from "../../_types";
import { parseJson, json, errorResponse } from "../../_lib/http";
import { normalizeEmail, isValidEmail } from "../../_lib/validators";
import { verifyPassword } from "../../_lib/crypto";
import { buildSessionCookie, createSession } from "../../_lib/sessions";

interface LoginPayload {
  email?: string;
  password?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const body = await parseJson<LoginPayload>(request);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return errorResponse(400, "请求参数不完整", "invalid_payload");
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return errorResponse(400, "邮箱格式不正确", "invalid_email");
  }

  const user = await env.DB.prepare(
    "SELECT id, email, password_hash, password_salt, email_verified_at FROM users WHERE email = ?"
  )
    .bind(email)
    .first<{
      id: string;
      email: string;
      password_hash: string;
      password_salt: string;
      email_verified_at: number | null;
    }>();

  if (!user) {
    return errorResponse(401, "邮箱或密码错误", "invalid_credentials");
  }

  const passwordOk = await verifyPassword(body.password, user.password_hash, user.password_salt);
  if (!passwordOk) {
    return errorResponse(401, "邮箱或密码错误", "invalid_credentials");
  }

  if (!user.email_verified_at) {
    return errorResponse(403, "邮箱未验证", "email_not_verified");
  }

  const sessionToken = await createSession(env, user.id);
  const cookie = buildSessionCookie(sessionToken, request);

  return json(
    {
      ok: true,
      user: { id: user.id, email: user.email, emailVerified: true },
    },
    {
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
};
