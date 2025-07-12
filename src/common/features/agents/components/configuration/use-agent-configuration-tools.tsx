import { useProvideAgentConfig } from "@/common/hooks/use-provide-agent-config";
import { AgentDef } from "@/common/types/agent";
import type { ToolCall, ToolDefinition } from "@agent-labs/agent-chat";
import { AgentConfigurationPreview } from "./agent-configuration-preview";

// 智能体配置工具定义
export const agentConfigurationTools: ToolDefinition[] = [
  {
    name: "updateAgent",
    description: "更新或创建智能体配置。当用户要求创建或修改智能体时使用此工具。",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "智能体的名称"
        },
        prompt: {
          type: "string",
          description: "智能体的系统提示词，定义其行为和角色"
        },
        personality: {
          type: "string",
          description: "智能体的性格特征，如友善、专业、幽默等"
        },
        role: {
          type: "string",
          enum: ["participant", "moderator"],
          description: "智能体的角色类型：participant（参与者）或moderator（主持人）"
        },
        expertise: {
          type: "array",
          items: {
            type: "string"
          },
          description: "智能体的专业技能和知识领域列表"
        },
        bias: {
          type: "string",
          description: "智能体的倾向性或偏好"
        },
        responseStyle: {
          type: "string",
          description: "智能体的回应风格，如正式、casual、技术性等"
        },
        avatar: {
          type: "string",
          description: "智能体头像URL（可选）"
        }
      },
      required: ["name", "prompt", "personality", "role"]
    }
  }
];

// Hook：提供智能体配置工具
export function useAgentConfigurationTools(
  onAgentCreate: (agent: Omit<AgentDef, "id">) => void, 
  editingAgent?: AgentDef
) {
  useProvideAgentConfig({
    tools: agentConfigurationTools,
    executors: {
      updateAgent: async (toolCall: ToolCall) => {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const agentConfig: Omit<AgentDef, "id"> = {
            name: args.name,
            prompt: args.prompt,
            personality: args.personality,
            role: args.role,
            expertise: args.expertise || [],
            bias: args.bias || "",
            responseStyle: args.responseStyle || "友好专业",
            avatar: args.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(args.name)}`,
          };
          if (onAgentCreate) {
            onAgentCreate(agentConfig);
          }
          return {
            toolCallId: toolCall.id,
            result: {
              success: true,
              message: `智能体 "${args.name}" 已成功创建！配置已应用。`,
              agentConfig: agentConfig
            },
            status: "success" as const
          };
        } catch (error) {
          console.error("更新agent失败:", error);
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              message: `更新智能体失败: ${error instanceof Error ? error.message : "未知错误"}`,
              error: error
            },
            status: "error" as const
          };
        }
      }
    },
    renderers: [
      {
        definition: {
          name: "updateAgent",
          description: "更新或创建智能体配置。当用户要求创建或修改智能体时使用此工具。",
          parameters: agentConfigurationTools[0].parameters,
        },
        render: (toolInvocation, onResult) => {
          const args = JSON.parse(toolInvocation.function.arguments);
          setTimeout(() => {
            onResult({
              toolCallId: toolInvocation.id,
              result: { confirmed: true, ...args },
              status: "success",
            });
          }, 300);
          return <AgentConfigurationPreview args={args} />;
        },
      },
    ],
    contexts: [
      {
        description: "当前正在编辑的智能体信息",
        value: JSON.stringify(editingAgent || {}),
      },
    ],
  });
} 