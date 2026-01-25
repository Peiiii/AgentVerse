import type { AuthUser } from "@/common/types/auth";

export interface AuthResponse {
  ok: boolean;
  user?: AuthUser;
  error?: string;
  code?: string;
}

async function request<T extends AuthResponse>(
  path: string,
  options: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    return {
      ok: false,
      error: "网络异常，请检查连接",
      code: "network_error",
    } as T;
  }

  const text = await response.text();
  let data: AuthResponse;
  try {
    data = text ? (JSON.parse(text) as AuthResponse) : { ok: response.ok };
  } catch {
    data = { ok: false, error: "服务器响应异常", code: "invalid_response" };
  }
  if (!response.ok && data.ok) {
    data.ok = false;
  }
  return data as T;
}

export const authClient = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<AuthResponse>("/api/auth/logout", {
      method: "POST",
    }),
  me: () =>
    request<AuthResponse>("/api/auth/me", {
      method: "GET",
    }),
  resendVerification: (email: string) =>
    request<AuthResponse>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verifyEmail: (token: string) =>
    request<AuthResponse>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  requestPasswordReset: (email: string) =>
    request<AuthResponse>("/api/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<AuthResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};
