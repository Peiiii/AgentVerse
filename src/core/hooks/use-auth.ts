import { useCallback } from "react";
import { authClient, type AuthResponse } from "@/core/utils/auth-client";
import { useAuthStore } from "@/core/stores/auth.store";

export function useAuth() {
  const { status, user, setStatus, setUser, reset } = useAuthStore();

  const refresh = useCallback(async () => {
    if (status === "loading") {
      return;
    }
    setStatus("loading");
    const result = await authClient.me();
    if (result.ok && result.user) {
      setUser(result.user);
      setStatus("authenticated");
      return result;
    }
    setUser(null);
    setStatus("unauthenticated");
    return result;
  }, [setStatus, setUser, status]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      const result = await authClient.login(email, password);
      if (result.ok && result.user) {
        setUser(result.user);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
      return result;
    },
    [setStatus, setUser]
  );

  const register = useCallback((email: string, password: string) => {
    return authClient.register(email, password);
  }, []);

  const logout = useCallback(async () => {
    await authClient.logout();
    reset();
  }, [reset]);

  const resendVerification = useCallback((email: string) => {
    return authClient.resendVerification(email);
  }, []);

  const verifyEmail = useCallback(
    async (token: string): Promise<AuthResponse> => {
      const result = await authClient.verifyEmail(token);
      if (result.ok && result.user) {
        setUser(result.user);
        setStatus("authenticated");
      }
      return result;
    },
    [setStatus, setUser]
  );

  const requestPasswordReset = useCallback((email: string) => {
    return authClient.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<AuthResponse> => {
      const result = await authClient.resetPassword(token, password);
      if (result.ok && result.user) {
        setUser(result.user);
        setStatus("authenticated");
      }
      return result;
    },
    [setStatus, setUser]
  );

  return {
    status,
    user,
    refresh,
    login,
    register,
    logout,
    resendVerification,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
  };
}
