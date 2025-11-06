import { create } from "zustand";
import type { AgentDef } from "@/common/types/agent";

export interface AgentsState {
  agents: AgentDef[];
  isLoading: boolean;
  error?: string;

  // setters
  setAgents: (agents: AgentDef[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg?: string) => void;
}

export const useAgentsStore = create<AgentsState>()((set) => ({
  agents: [],
  isLoading: false,
  error: undefined,

  setAgents: (agents) => set({ agents }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
}));

