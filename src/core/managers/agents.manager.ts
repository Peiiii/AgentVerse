import { agentService } from "@/core/services/agent.service";
import { agentListResource } from "@/core/resources";
import type { AgentDef } from "@/common/types/agent";

// Repository-like manager with no local store. Reads from resource, writes via service then reloads resource.
export class AgentsManager {
  // lifecycle
  load = async () => {
    await agentListResource.reload();
  };

  // CRUD
  add = async (agent: Omit<AgentDef, "id">) => {
    const created = await agentService.createAgent(agent);
    await agentListResource.reload();
    return created;
  };

  addDefault = async () => {
    const seed = Date.now().toString();
    const defaultAgent: Omit<AgentDef, "id"> = {
      name: "新成员",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
      prompt: "请在编辑时设置该成员的具体职责和行为方式。",
      role: "participant",
      personality: "待设置",
      expertise: [],
      bias: "待设置",
      responseStyle: "待设置",
    };
    return this.add(defaultAgent);
  };

  update = async (id: string, data: Partial<AgentDef>) => {
    const updated = await agentService.updateAgent(id, data);
    await agentListResource.reload();
    return updated;
  };

  remove = async (id: string) => {
    await agentService.deleteAgent(id);
    await agentListResource.reload();
  };

  // helpers
  getAgentName = (id: string) => {
    if (id === "user") return "我";
    const state = agentListResource.getState();
    const data = state.data || [];
    return (data as AgentDef[]).find((a) => a.id === id)?.name ?? "未知";
  };

  getAgentAvatar = (id: string) => {
    if (id === "user") {
      try {
        const stored = typeof window !== "undefined" ? window.localStorage.getItem("userAvatar") : null;
        return stored || "";
      } catch {
        return "";
      }
    }
    const state = agentListResource.getState();
    const data = state.data || [];
    return (data as AgentDef[]).find((a) => a.id === id)?.avatar || "";
  };
}
