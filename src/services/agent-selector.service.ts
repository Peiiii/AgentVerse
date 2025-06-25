import { aiService } from "./ai.service";
import { Agent } from "@/common/types/agent";

export class AgentSelectorService {
  async selectAgents(
    topic: string,
    availableAgents: Agent[]
  ): Promise<string[]> {
    const agentProfiles = availableAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      expertise: agent.expertise,
      prompt: agent.prompt,
    }));

    const response = await this.askAI(topic, agentProfiles);
    return this.parseResponse(response);
  }

  private async askAI(
    topic: string,
    agents: Pick<Agent, "id" | "name" | "expertise" | "prompt">[]
  ): Promise<string> {
    const prompt = `
用户问题：${topic}
可选择的Agent列表：
${JSON.stringify(agents, null, 2)}
请选择合适的Agent参与讨论。
必须使用以下JSON格式返回，并使用 <select_result> 标签包裹：
<select_result>
{
    "selected_agents": [
        {
            "id": "agent_id",
            "reason": "选择原因"
        }
    ]
}
</select_result>`;

    return aiService.chatCompletion([{ role: "user", content: prompt }]);
  }

  private parseResponse(response: string): string[] {
    try {
      const match = response.match(
        /<select_result>([\s\S]*?)<\/select_result>/
      );
      if (!match) return [];

      const result = JSON.parse(match[1].trim());
      return (
        result?.selected_agents?.map(
          (a: { id: string; reason: string }) => a.id
        ) || []
      );
    } catch {
      return [];
    }
  }
}

export const agentSelector = new AgentSelectorService();
