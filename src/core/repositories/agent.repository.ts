import { AgentDef } from "@/common/types/agent";
import { AgentDataProvider } from "@/common/types/storage";
import { dataProviders } from "@/core/repositories/data-providers";

export class AgentRepository {
  constructor(private readonly provider: AgentDataProvider) {}

  async listAgents(): Promise<AgentDef[]> {
    return this.provider.list();
  }

  async getAgent(id: string): Promise<AgentDef> {
    return this.provider.get(id);
  }

  async createAgent(data: Omit<AgentDef, "id">): Promise<AgentDef> {
    if (!data.name) {
      throw new Error("Agent name is required");
    }

    return this.provider.create(data);
  }

  async updateAgent(id: string, data: Partial<AgentDef>): Promise<AgentDef> {
    return this.provider.update(id, data);
  }

  async deleteAgent(id: string): Promise<void> {
    await this.provider.delete(id);
  }
}

export const agentRepository = new AgentRepository(
  dataProviders.agents as AgentDataProvider
);
