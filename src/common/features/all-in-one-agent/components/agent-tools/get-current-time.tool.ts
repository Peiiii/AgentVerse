import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import React from "react";

interface GetCurrentTimeResult {
  currentTime: string;
  timezone: string;
  message: string;
}

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
  render: (toolCall: ToolCall & { result?: GetCurrentTimeResult }) => {
    const currentTime = toolCall.result?.currentTime || "-";
    const timezone = toolCall.result?.timezone || "-";
    return React.createElement(
      "div",
      {
        style: {
          background: '#f1f5f9',
          borderRadius: 12,
          padding: '18px 24px',
          boxShadow: '0 2px 8px #6366f133',
          fontSize: 17,
          color: '#22223b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
          minWidth: 220,
        }
      },
      React.createElement("div", { style: { fontWeight: 700, fontSize: 16, color: '#0ea5e9', marginBottom: 4 } }, "⏰ 当前时间"),
      React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, "时间："),
      React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 18, color: '#22223b', background: '#fff', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, currentTime),
      React.createElement("div", { style: { fontSize: 15, color: '#64748b' } }, "时区："),
      React.createElement("div", { style: { fontFamily: 'Menlo, monospace', fontSize: 16, color: '#6366f1', background: '#f1f5f9', borderRadius: 8, padding: '6px 12px', margin: '4px 0' } }, timezone)
    );
  },
}; 