import { useAgentsStore } from "@/core/stores/agents.store";
import { agentService } from "@/core/services/agent.service";
import type { AgentDef } from "@/common/types/agent";

export class AgentsManager {
  store = useAgentsStore;

  // reads
  getAll = () => this.store.getState().agents;

  // lifecycle
  load = async () => {
    const s = this.store.getState();
    s.setLoading(true);
    try {
      const data = await agentService.listAgents();
      s.setAgents(data);
      s.setError(undefined);
    } catch (e) {
      s.setError(e instanceof Error ? e.message : String(e));
    } finally {
      s.setLoading(false);
    }
  };

  add = async (agent: Omit<AgentDef, "id">) => {
    const created = await agentService.createAgent(agent);
    const { agents, setAgents } = this.store.getState();
    setAgents([...agents, created]);
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
    const { agents, setAgents } = this.store.getState();
    setAgents(agents.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  remove = async (id: string) => {
    await agentService.deleteAgent(id);
    const { agents, setAgents } = this.store.getState();
    setAgents(agents.filter((a) => a.id !== id));
  };

  getAgentName = (id: string) => {
    if (id === "user") return "我";
    return this.store.getState().agents.find((a) => a.id === id)?.name ?? "未知";
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
    return this.store.getState().agents.find((a) => a.id === id)?.avatar || "";
  };
}

