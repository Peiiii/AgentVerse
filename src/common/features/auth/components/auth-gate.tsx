import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppLoading } from "@/common/features/app/components/app-loading";
import { useAuth } from "@/core/hooks/use-auth";
import { AuthRoutes } from "./auth-routes";

const AUTH_PATHS = ["/login", "/verify", "/forgot", "/reset"];

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const location = useLocation();
  const { status, refresh } = useAuth();

  const isAuthPath = AUTH_PATHS.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    if (status === "idle") {
      void refresh();
    }
  }, [refresh, status]);

  if (status === "idle" || status === "loading") {
    return <AppLoading />;
  }

  if (isAuthPath) {
    if (status === "authenticated" && location.pathname === "/login") {
      return <Navigate to="/chat" replace />;
    }
    return <AuthRoutes />;
  }

  if (status !== "authenticated") {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
}
