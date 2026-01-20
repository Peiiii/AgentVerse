import { useAgentsStore } from "@/core/stores/agents.store";

// Store-first hook for Agent list.
export function useAgents() {
  const { data, isLoading, error } = useAgentsStore();
  return {
    agents: data,
    isLoading,
    error: error || undefined,
  };
}
