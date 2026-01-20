import { create } from "zustand";
import type { AgentDef } from "@/common/types/agent";

export interface AgentsState {
  data: AgentDef[];
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setData: (data: AgentDef[]) => void;
  setError: (error: string | null) => void;
}

export const useAgentsStore = create<AgentsState>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setData: (data) => set({ data, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false }),
}));
