import type { Env } from "../../_types";
import { json, errorResponse } from "../../_lib/http";
import { getSessionToken, getSessionUser } from "../../_lib/sessions";

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const token = getSessionToken(request);
  if (!token) {
    return errorResponse(401, "未登录", "unauthenticated");
  }
  const user = await getSessionUser(env, token);
  if (!user) {
    return errorResponse(401, "未登录", "unauthenticated");
  }
  return json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_verified_at),
    },
  });
};
