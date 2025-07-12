import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { useProvideAgentContexts } from "@agent-labs/agent-chat";
import { AgentDef } from "@/common/types/agent";
import { createUpdateAgentTool } from "../agent-tools/update-agent-tool";

// Hook：提供智能体配置工具
export function useAgentConfigurationTools(
  onAgentCreate: (agent: Omit<AgentDef, "id">) => void, 
  editingAgent?: AgentDef
) {
  // 直接用工厂函数生成唯一的tool，所有callback逻辑都在tool里
  const updateAgentTool = createUpdateAgentTool(onAgentCreate);
  useProvideAgentTools([updateAgentTool]);
  useProvideAgentContexts([
    {
      description: "当前正在编辑的智能体信息",
      value: JSON.stringify(editingAgent || {}),
    },
  ]);
} 