import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { agentService } from "@/core/services/agent.service";
import type { ToolCall } from "@agent-labs/agent-chat";
import React from "react";
import type { AgentDef } from "@/common/types/agent";

type AgentManagementCommand = "list" | "create" | "update" | "delete" | "get";

interface AgentManagementResult {
  command: AgentManagementCommand;
  result?: any;
  error?: string;
  message?: string;
}

export const agentManagementTool: AgentTool = {
  name: "agent_management",
  description: "管理AI代理，支持创建、更新、删除、查询和列出代理。",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "要执行的命令：'list', 'create', 'update', 'delete', 'get'",
        enum: ["list", "create", "update", "delete", "get"],
      },
      agent_id: {
        type: "string",
        description: "要操作的代理ID (对于 'update', 'delete', 'get' 是必须的)",
      },
      agent_data: {
        type: "object",
        description: "代理的数据 (对于 'create' 和 'update' 是必须的)",
        properties: {
          name: { type: "string" },
          avatar: { type: "string" },
          prompt: { type: "string" },
          role: { type: "string" },
          personality: { type: "string" },
          expertise: { type: "array", items: { type: "string" } },
          bias: { type: "string" },
          responseStyle: { type: "string" },
        },
      },
    },
    required: ["command"],
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments);
    const { command, agent_id, agent_data } = args;

    try {
      let result: any;
      let message: string = "";

      switch (command) {
        case "list":
          result = await agentService.listAgents();
          message = `成功列出 ${result.length} 个代理。`;
          break;
        case "get":
          if (!agent_id) throw new Error("缺少 agent_id");
          result = await agentService.getAgent(agent_id);
          message = `成功获取代理 ${agent_id} 的信息。`;
          break;
        case "create":
          if (!agent_data) throw new Error("缺少 agent_data");
          result = await agentService.createAgent(agent_data);
          message = `成功创建新代理，ID: ${result.id}。`;
          break;
        case "update":
          if (!agent_id) throw new Error("缺少 agent_id");
          if (!agent_data) throw new Error("缺少 agent_data");
          result = await agentService.updateAgent(agent_id, agent_data);
          message = `成功更新代理 ${agent_id}。`;
          break;
        case "delete":
          if (!agent_id) throw new Error("缺少 agent_id");
          await agentService.deleteAgent(agent_id);
          message = `成功删除代理 ${agent_id}。`;
          break;
        default:
          throw new Error(`未知的命令: ${command}`);
      }

      return {
        toolCallId: toolCall.id,
        result: { command, result, message },
        status: "success" as const,
      };
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        result: {
          command,
          error: error.message,
        },
        status: "error" as const,
      };
    }
  },
  render: (toolCall: ToolCall & { result?: AgentManagementResult }) => {
    const args = JSON.parse(toolCall.function.arguments);
    const { command } = args;
    const result = toolCall.result?.result;
    const error = toolCall.result?.error;
    const message = toolCall.result?.message;

    const Agent = ({ agent }: { agent: AgentDef }) => (
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
        <strong>{agent.name}</strong>
        <div style={{ fontSize: 12, color: '#888' }}>ID: {agent.id}</div>
        <div>角色: {agent.role}</div>
        <div>性格: {agent.personality}</div>
      </div>
    );

    return (
      <div
        style={{
          background: '#f8fafc',
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
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: '#6366f1', marginBottom: 4 }}>🧑‍💼 代理管理</div>
        <div>命令: {command}</div>
        {message && <div style={{ color: 'green' }}>{message}</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {result && command === 'list' && Array.isArray(result) && result.map(agent => <Agent key={agent.id} agent={agent} />)}
        {result && (command === 'get' || command === 'create' || command === 'update') && <Agent agent={result} />}
      </div>
    );
  },
};
