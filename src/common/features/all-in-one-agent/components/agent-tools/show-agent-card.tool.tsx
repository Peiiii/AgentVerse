import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { agentService } from "@/core/services/agent.service";
import type { ToolCall } from "@agent-labs/agent-chat";
import React from "react";
import type { AgentDef } from "@/common/types/agent";

interface ShowAgentCardResult {
  agent?: AgentDef;
  error?: string;
}

export const createShowAgentCardTool = (openAgentChat: (agentId: string) => void): AgentTool => ({
  name: "show_agent_card",
  description: "以卡片形式展示一个AI代理的信息，并可以点击打开对话。",
  parameters: {
    type: "object",
    properties: {
      agent_id: {
        type: "string",
        description: "要展示的代理ID",
      },
    },
    required: ["agent_id"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    const { agent_id } = args;

    try {
      const agent = await agentService.getAgent(agent_id);
      return {
        toolCallId: toolCall.id,
        result: { agent },
        status: "success" as const,
      };
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        result: {
          error: `获取代理信息失败: ${error.message}`,
        },
        status: "error" as const,
      };
    }
  },
  render: (toolCall: ToolCall & { result?: ShowAgentCardResult }) => {
    const { agent, error } = toolCall.result || {};

    if (error) {
      return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!agent) {
      return <div>正在加载代理信息...</div>;
    }

    const handleCardClick = () => {
      openAgentChat(agent.id);
    };

    return (
      <div
        onClick={handleCardClick}
        style={{
          background: 'white',
          borderRadius: 12,
          padding: '18px 24px',
          boxShadow: '0 4px 12px #0000001a',
          fontSize: 17,
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: '1px solid #e0e7ff',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px #00000026';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px #0000001a';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={agent.avatar} alt={agent.name} style={{ width: 60, height: 60, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 20 }}>{agent.name}</div>
                <div style={{ fontSize: 14, color: '#666' }}>{agent.role}</div>
            </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.6 }}>{agent.prompt}</div>
        <div style={{ fontSize: 12, color: '#999', textAlign: 'right', width: '100%' }}>
            点击卡片开始对话
        </div>
      </div>
    );
  },
});
