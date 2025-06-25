import { STORAGE_CONFIG } from "@/config/storage";
import { MockHttpProvider } from "@/common/lib/storage";
import { Agent } from "@/common/types/agent";
import { AgentDataProvider } from "@/common/types/storage";

export class AgentService {
  constructor(private provider: AgentDataProvider) {}

  async listAgents(): Promise<Agent[]> {
    return this.provider.list();
  }

  async getAgent(id: string): Promise<Agent> {
    return this.provider.get(id);
  }

  async createAgent(data: Omit<Agent, "id">): Promise<Agent> {
    // 这里可以添加业务验证逻辑
    if (!data.name) {
      throw new Error("Agent name is required");
    }

    const result = await this.provider.create(data);
    return result;
  }

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    const result = await this.provider.update(id, data);
    return result;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.provider.delete(id);
  }
  // 工具方法
  createDefaultAgent(): Omit<Agent, "id"> {
    const seed = Date.now().toString();
    return {
      name: "新成员",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4,c7f2a4,f4d4d4`,
      prompt: "请在编辑时设置该成员的具体职责和行为方式。",
      role: "participant",
      personality: "待设置",
      expertise: [],
      bias: "待设置",
      responseStyle: "待设置",
    };
  }
}

export const agentService = new AgentService(
  new MockHttpProvider<Agent>(
    STORAGE_CONFIG.KEYS.AGENTS,
    { delay: STORAGE_CONFIG.MOCK_DELAY_MS }
  )
);
