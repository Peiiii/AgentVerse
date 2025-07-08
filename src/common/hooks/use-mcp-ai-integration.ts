import { adaptMCPToolsToToolDefinitions, extractMCPToolInfo, formatMCPToolDescription } from "@/common/lib/mcp/mcp-tool-adapter";
import type { ToolExecutor, ToolRenderer } from "@agent-labs/agent-chat";
import React, { useMemo } from "react";
import { useProvideAgentConfig } from "./use-provide-agent-config";
import { useMCPConnectionManager } from "./use-mcp-connection-manager";

/**
 * MCP AI工具集成Hook
 * 
 * 设计原则：
 * - 专注于MCP工具与AI聊天的集成
 * - 将MCP工具转换为AI可用的格式
 * - 处理工具执行和渲染逻辑
 */
export function useMCPAIIntegration() {
    const { connections, activeClients } = useMCPConnectionManager();

    // 获取所有MCP工具定义
    const mcpToolDefinitions = useMemo(() => {
        return connections.flatMap((connection) =>
            adaptMCPToolsToToolDefinitions(connection)
        );
    }, [connections]);

    // 创建MCP工具执行器
    const mcpToolExecutors = useMemo(() => {
        const executors: Record<string, ToolExecutor> = {};

        for (const toolDef of mcpToolDefinitions) {
            const toolInfo = extractMCPToolInfo(toolDef.name);
            if (!toolInfo) continue;

            executors[toolDef.name] = async (toolCall) => {
                try {
                    const client = activeClients.get(toolInfo.connectionId);
                    if (!client) {
                        throw new Error(`Client not found for connection ${toolInfo.connectionId}`);
                    }

                    if (!client.client) {
                        throw new Error("MCP client not connected");
                    }

                    const result = await client.client.callTool({
                        name: toolInfo.toolName,
                        arguments: JSON.parse(toolCall.function.arguments)
                    });

                    return {
                        toolCallId: toolCall.id,
                        result: result,
                        status: "success" as const,
                    };
                } catch (err) {
                    return {
                        toolCallId: toolCall.id,
                        result: { error: err instanceof Error ? err.message : "执行失败" },
                        status: "error" as const,
                    };
                }
            };
        }

        return executors;
    }, [mcpToolDefinitions, activeClients]);

    // 创建MCP工具渲染器
    const mcpToolRenderers = useMemo(() => {
        const renderers: ToolRenderer[] = [];

        for (const connection of connections) {
            if (connection.status !== "connected") continue;

            for (const tool of connection.tools) {
                const toolDefName = `mcp_${connection.id}_${tool.name}`;

                renderers.push({
                    definition: {
                        name: toolDefName,
                        description: formatMCPToolDescription(tool, connection.config.name),
                        parameters: {
                            type: tool.inputSchema?.type as any || "object",
                            properties: tool.inputSchema?.properties || {},
                            required: tool.inputSchema?.required || [],
                        },
                    },
                    render: (toolInvocation) => {
                        const args = JSON.parse(toolInvocation.function.arguments);

                        return React.createElement("div", {
                            className: "p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/60 dark:to-indigo-900/60 shadow dark:border-gray-700"
                        }, [
                            React.createElement("h3", {
                                key: "title",
                                className: "font-bold mb-2 text-blue-700 dark:text-blue-200 flex items-center gap-2"
                            }, "🔧 MCP工具调用"),
                            React.createElement("div", {
                                key: "content",
                                className: "mb-2 text-sm text-gray-700 dark:text-gray-200"
                            }, [
                                `服务器：${connection.config.name}`,
                                React.createElement("br", { key: "br1" }),
                                `工具：${tool.name}`,
                                React.createElement("br", { key: "br2" }),
                                "参数：",
                                React.createElement("pre", {
                                    key: "args",
                                    className: "mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto"
                                }, JSON.stringify(args, null, 2))
                            ]),
                            React.createElement("div", {
                                key: "status",
                                className: "text-center text-xs text-gray-400 dark:text-gray-500 mt-2"
                            }, "正在执行MCP工具调用...")
                        ]);
                    },
                });
            }
        }

        return renderers;
    }, [connections]);

    // 自动提供MCP工具给@agent-labs/agent-chat
    useProvideAgentConfig({
        tools: mcpToolDefinitions,
        executors: mcpToolExecutors,
        renderers: mcpToolRenderers,
    });

    return {
        mcpToolDefinitions,
        mcpToolExecutors,
        mcpToolRenderers,
        connectedToolsCount: mcpToolDefinitions.length,
        connectedServersCount: connections.filter(c => c.status === "connected").length,
    };
} 