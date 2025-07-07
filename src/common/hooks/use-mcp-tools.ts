import { MCPConnectionManager, type MCPConnection, type MCPServerConfig } from "@/common/lib/mcp/mcp-connection-manager";
import {
    adaptMCPToolsToToolDefinitions,
    extractMCPToolInfo,
    formatMCPToolDescription
} from "@/common/lib/mcp/mcp-tool-adapter";
import type { ToolExecutor, ToolRenderer } from "@agent-labs/agent-chat";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useProvideAgentConfig } from "./use-provide-agent-config";

/**
 * MCP工具管理Hook
 * 提供MCP服务器连接管理和工具集成功能
 */
export function useMCPTools() {
    const [connectionManager] = useState(() => new MCPConnectionManager());
    const [connections, setConnections] = useState<MCPConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 监听连接状态变化
    useEffect(() => {
        const updateConnections = () => {
            setConnections(connectionManager.getConnections());
        };

        connectionManager.on("connectionCreated", updateConnections);
        connectionManager.on("connectionEstablished", updateConnections);
        connectionManager.on("connectionDisconnected", updateConnections);
        connectionManager.on("connectionFailed", updateConnections);
        connectionManager.on("toolsUpdated", updateConnections);

        // 初始化连接列表
        updateConnections();

        return () => {
            connectionManager.removeAllListeners();
        };
    }, [connectionManager]);

    // 连接到MCP服务器
    const connectToServer = useCallback(async (config: MCPServerConfig) => {
        setIsLoading(true);
        setError(null);

        try {
            const connectionId = await connectionManager.connect(config);
            return connectionId;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "连接失败";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [connectionManager]);

    // 断开MCP服务器连接
    const disconnectFromServer = useCallback(async (connectionId: string) => {
        try {
            await connectionManager.disconnect(connectionId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "断开连接失败";
            setError(errorMessage);
            throw err;
        }
    }, [connectionManager]);

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
                    const result = await connectionManager.executeTool(
                        toolInfo.connectionId,
                        {
                            toolName: toolInfo.toolName,
                            arguments: JSON.parse(toolCall.function.arguments),
                        }
                    );

                    return {
                        toolCallId: toolCall.id,
                        result: result.success ? result.result : { error: result.error },
                        status: result.success ? "success" as const : "error" as const,
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
    }, [mcpToolDefinitions, connectionManager]);

    // 创建MCP工具渲染器
    const mcpToolRenderers = useMemo(() => {
        const renderers: ToolRenderer[] = [];

        for (const connection of connections) {
            for (const tool of connection.tools) {
                const toolDefName = `mcp_${connection.id}_${tool.name}`;

                renderers.push({
                    definition: {
                        name: toolDefName,
                        description: formatMCPToolDescription(tool, connection.config.name),
                        parameters: {
                            type: tool.inputSchema.type as any,
                            properties: tool.inputSchema.properties,
                            required: tool.inputSchema.required || [],
                        },
                    },
                    render: (toolInvocation, _onResult) => {
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
                                `工具：${tool.name}`,
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

    // 提供MCP工具给@agent-labs/agent-chat
    useProvideAgentConfig({
        tools: mcpToolDefinitions,
        executors: mcpToolExecutors,
        renderers: mcpToolRenderers,
    });

    return {
        // 连接管理
        connections,
        isLoading,
        error,
        connectToServer,
        disconnectFromServer,

        // 工具信息
        mcpToolDefinitions,
        mcpToolExecutors,
        mcpToolRenderers,

        // 工具管理
        getConnection: connectionManager.getConnection.bind(connectionManager),
        getTools: connectionManager.getTools.bind(connectionManager),
    };
} 