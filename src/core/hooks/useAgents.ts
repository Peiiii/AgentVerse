import { usePresenter } from "@/core/presenter";
// Thin adapter to new AgentsManager + store. Kept for compatibility.
export function useAgents() {
  const presenter = usePresenter();
  const agents = presenter.agents.store((s) => s.agents);
  const isLoading = presenter.agents.store((s) => s.isLoading);
  const error = presenter.agents.store((s) => s.error);

  return {
    agents,
    isLoading,
    error,
  };
}
