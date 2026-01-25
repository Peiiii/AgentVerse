import { create } from "zustand";
import type { AuthUser } from "@/common/types/auth";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  setStatus: (status: AuthStatus) => void;
  setUser: (user: AuthUser | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  user: null,
  setStatus: (status) => set({ status }),
  setUser: (user) => set({ user }),
  reset: () => set({ status: "unauthenticated", user: null }),
}));
