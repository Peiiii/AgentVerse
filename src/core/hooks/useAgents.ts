import { usePresenter } from "@/core/presenter";
import type { AgentDef } from "@/common/types/agent";

interface UseAgentsProps {
  onChange?: (agents: AgentDef[]) => void;
}

// Thin adapter to new AgentsManager + store. Kept for compatibility.
export function useAgents(_opts: UseAgentsProps = {}) {
  const presenter = usePresenter();
  const agents = presenter.agents.store((s) => s.agents);
  const isLoading = presenter.agents.store((s) => s.isLoading);
  const error = presenter.agents.store((s) => s.error);

  return {
    agents,
    isLoading,
    error,
    addAgent: presenter.agents.addDefault,
    updateAgent: presenter.agents.update,
    deleteAgent: presenter.agents.remove,
    getAgentName: presenter.agents.getName,
    getAgentAvatar: presenter.agents.getAvatar,
  };
}
