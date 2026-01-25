import type { Env } from "../../_types";
import { json } from "../../_lib/http";
import { getSessionToken, deleteSession, buildClearSessionCookie } from "../../_lib/sessions";

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const token = getSessionToken(request);
  if (token) {
    await deleteSession(env, token);
  }
  return json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": buildClearSessionCookie(request),
      },
    }
  );
};
