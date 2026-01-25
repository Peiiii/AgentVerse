import type { Env } from "../_types";

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function parseAllowedOrigins(env: Env): string[] {
  if (!env.APP_URLS) {
    return [];
  }
  return env.APP_URLS.split(",")
    .map((item) => normalizeOrigin(item.trim()))
    .filter((item): item is string => Boolean(item));
}

export function getAppUrl(request: Request, env: Env): string {
  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = parseAllowedOrigins(env);
  if (allowedOrigins.length > 0 && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  const fallback = normalizeOrigin(env.APP_URL);
  return fallback || requestOrigin;
}

export function getEmailFrom(env: Env): string {
  return env.EMAIL_FROM || "AgentVerse <noreply@bibo.bot>";
}
