import { ensureDefaultAgents } from "@/core/bootstrap/agents.bootstrap";
import { agentListResource, discussionsResource } from "@/core/resources";

export async function bootstrapApp() {
  // Seed/upgrade built-in agents, then prime resources
  await ensureDefaultAgents();
  await agentListResource.reload();
  await discussionsResource.list.reload();
}

