import { useResourceState } from "@/common/lib/resource";
import { agentsResource } from "@/core/resources";

// Resource-first hook for Agent list; prefer此钩子而不是直接读取 store。
export function useAgents() {
  const { data, isLoading, error } = useResourceState(agentsResource.list);
  return {
    agents: data,
    isLoading,
    error: error ? error.message : undefined,
  };
}
