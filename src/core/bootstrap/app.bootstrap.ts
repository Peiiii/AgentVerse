import { ensureDefaultAgents } from "@/core/bootstrap/agents.bootstrap";
import { getPresenter } from "@/core/presenter";

export async function bootstrapApp() {
  // Seed/upgrade built-in agents, then prime stores
  await ensureDefaultAgents();
  const presenter = getPresenter();
  await presenter.agents.load();
  await presenter.discussions.load();
  await presenter.settings.load();
}
