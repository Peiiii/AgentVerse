type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export function json(data: JsonValue, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorResponse(status: number, message: string, code?: string): Response {
  return json({ ok: false, error: message, code }, { status });
}

export async function parseJson<T extends Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
