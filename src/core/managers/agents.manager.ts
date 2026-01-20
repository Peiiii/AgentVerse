import { agentService } from "@/core/services/agent.service";
import type { AgentDef } from "@/common/types/agent";
import { useAgentsStore } from "@/core/stores/agents.store";

// Repository-like manager with no local store. Reads from resource, writes via service then reloads resource.
export class AgentsManager {
  // lifecycle
  load = async () => {
    const store = useAgentsStore.getState();
    store.setLoading(true);
    try {
      const list = await agentService.listAgents();
      store.setData(list);
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [];
    }
  };

  // CRUD
  add = async (agent: Omit<AgentDef, "id">) => {
    const created = await agentService.createAgent(agent);
    await this.load();
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
    await this.load();
    return updated;
  };

  remove = async (id: string) => {
    await agentService.deleteAgent(id);
    await this.load();
  };

  // helpers
  getAll = () => useAgentsStore.getState().data;
  getAgentName = (id: string) => {
    if (id === "user") return "我";
    return this.getAll().find((a) => a.id === id)?.name ?? "未知";
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
    return this.getAll().find((a) => a.id === id)?.avatar || "";
  };
}
