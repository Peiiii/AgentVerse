import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";

// 基础工具：获取当前时间
export const getCurrentTimeTool: AgentTool = {
  name: "getCurrentTime",
  description: "获取当前时间",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async (toolCall) => {
    return {
      toolCallId: toolCall.id,
      result: {
        currentTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        message: "当前时间已获取",
      },
      status: "success" as const,
    };
  },
}; 