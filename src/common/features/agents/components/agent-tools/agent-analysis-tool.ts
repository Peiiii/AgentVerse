import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";

// 智能体分析工具：基于真实数据
export const createAgentAnalysisTool = (agentDef: AgentDef): AgentTool => ({
  name: "analyzeAgentCapability",
  description: "分析当前智能体的能力和配置",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async (toolCall) => {
    // 基于真实的 agent 数据进行分析
    const capabilities = [];
    
    if (agentDef.prompt) {
      capabilities.push("系统提示词配置");
    }
    if (agentDef.expertise && agentDef.expertise.length > 0) {
      capabilities.push(`${agentDef.expertise.length} 个专业领域`);
    }
    if (agentDef.personality) {
      capabilities.push("个性化性格特征");
    }
    if (agentDef.role) {
      capabilities.push(`${agentDef.role === 'moderator' ? '主持人' : '参与者'}角色`);
    }
    
    return {
      toolCallId: toolCall.id,
      result: {
        agentName: agentDef.name,
        role: agentDef.role,
        expertise: agentDef.expertise || [],
        personality: agentDef.personality,
        promptLength: agentDef.prompt?.length || 0,
        capabilities,
        message: `智能体 "${agentDef.name}" 具备 ${capabilities.length} 项能力`,
      },
      status: "success" as const,
    };
  },
}); 