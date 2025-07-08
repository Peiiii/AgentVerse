import { MCPConnectionManager, type MCPConnection, type MCPServerConfig } from "@/common/lib/mcp/mcp-connection-manager";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MCPConnectionManagerContextValue } from "../components/mcp/mcp-provider";
import { useMCPClient } from "./use-mcp-client";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * 多MCP连接管理Hook
 * 
 * 设计原则：
 * - 专注于管理多个MCP服务器连接
 * - 不处理AI工具集成逻辑（由单独的Hook处理）
 * - 提供简洁的连接管理API
 */
export function useMCPConnectionManager(): MCPConnectionManagerContextValue {
    const [connectionManager] = useState(() => new MCPConnectionManager());
    const [connections, setConnections] = useState<MCPConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 活跃连接的客户端实例
    const [activeClients, setActiveClients] = useState<Map<string, ReturnType<typeof useMCPClient>>>(new Map());

    // 监听连接状态变化
    useEffect(() => {
        const updateConnections = () => {
            setConnections(connectionManager.getConnections());
        };

        // 定期更新连接状态
        const interval = setInterval(updateConnections, 1000);
        updateConnections();

        return () => {
            clearInterval(interval);
        };
    }, [connectionManager]);

    // 连接到MCP服务器
    const connectToServer = useCallback(async (config: MCPServerConfig) => {
        setIsLoading(true);
        setError(null);

        try {
            // 创建连接记录
            const connectionId = await connectionManager.createConnection(config);

            // 更新连接状态
            connectionManager.updateConnectionStatus(connectionId, "connecting");

            return connectionId;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "连接失败";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [connectionManager]);

    // 使用客户端连接到服务器
    const connectWithClient = useCallback(async (connectionId: string, client: ReturnType<typeof useMCPClient>) => {
        const connection = connectionManager.getConnection(connectionId);
        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        try {
            // 根据配置中的type字段选择传输协议
            const transportType = connection.config.type === "sse" ? "sse" : "http";
            console.log(`连接到MCP服务器 ${connection.config.name}，使用 ${transportType} 传输协议`);

            await client.connect(connection.config.url, transportType);

            // 更新连接状态和数据
            connectionManager.updateConnectionStatus(connectionId, "connected");
            connectionManager.updateConnectionData(connectionId, {
                tools: client.tools,
                resources: client.resources,
                prompts: client.prompts
            });

            // 保存客户端实例
            setActiveClients(prev => new Map(prev).set(connectionId, client));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "连接失败";
            connectionManager.updateConnectionStatus(connectionId, "error", errorMessage);
            throw err;
        }
    }, [connectionManager]);

    // 断开MCP服务器连接
    const disconnectFromServer = useCallback(async (connectionId: string) => {
        try {
            const client = activeClients.get(connectionId);
            if (client) {
                await client.disconnect();
                setActiveClients(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(connectionId);
                    return newMap;
                });
            }

            await connectionManager.disconnect(connectionId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "断开连接失败";
            setError(errorMessage);
            throw err;
        }
    }, [connectionManager, activeClients]);

    // 删除连接
    const removeConnection = useCallback(async (connectionId: string) => {
        try {
            await disconnectFromServer(connectionId);
            connectionManager.removeConnection(connectionId);
        } catch (err) {
            console.error("Failed to remove connection:", err);
        }
    }, [disconnectFromServer, connectionManager]);

    // 批量导入服务器
    const importServers = useCallback(async (configList: MCPServerConfig[]) => {
        return await connectionManager.importServers(configList);
    }, [connectionManager]);

    // 批量导入并自动连接服务器
    const importAndConnectServers = useCallback(async (configList: MCPServerConfig[]) => {
        const results = {
            total: configList.length,
            successful: 0,
            failed: 0,
            connectionIds: [] as string[]
        };

        for (const config of configList) {
            try {
                // 创建连接记录
                const connectionId = await connectionManager.createConnection(config);
                connectionManager.updateConnectionStatus(connectionId, "connecting");
                results.connectionIds.push(connectionId);

                // 创建独立的客户端实例
                const client = new Client({
                    name: "agentverse-mcp-client",
                    version: "1.0.0"
                });

                // 根据配置选择传输协议
                const transportType = config.type === "sse" ? "sse" : "http";
                let clientTransport: StreamableHTTPClientTransport | SSEClientTransport;

                if (transportType === "sse") {
                    clientTransport = new SSEClientTransport(new URL(config.url));
                } else {
                    clientTransport = new StreamableHTTPClientTransport(new URL(config.url));
                }

                // 连接到服务器
                await client.connect(clientTransport);
                console.log(`✅ 成功连接到 ${config.name} (${transportType})`);

                // 加载工具、资源和提示
                const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
                    client.listTools().catch(() => ({ tools: [] })),
                    client.listResources().catch(() => ({ resources: [] })),
                    client.listPrompts().catch(() => ({ prompts: [] }))
                ]);

                // 更新连接状态和数据
                connectionManager.updateConnectionStatus(connectionId, "connected");
                connectionManager.updateConnectionData(connectionId, {
                    tools: toolsResult.tools || [],
                    resources: resourcesResult.resources || [],
                    prompts: promptsResult.prompts || []
                });

                // 创建一个客户端包装器来保存实例
                const clientWrapper = {
                    client,
                    status: "connected" as const,
                    error: null,
                    tools: toolsResult.tools || [],
                    resources: resourcesResult.resources || [],
                    prompts: promptsResult.prompts || [],
                    connect: async () => { throw new Error("Already connected"); },
                    disconnect: async () => {
                        await client.close();
                    },
                    refreshTools: async () => {
                        // 刷新工具列表但不返回
                        try {
                            const result = await client.listTools();
                            connectionManager.updateConnectionData(connectionId, {
                                tools: result.tools || []
                            });
                        } catch (error) {
                            console.error("Failed to refresh tools:", error);
                        }
                    },
                    refreshResources: async () => {
                        // 刷新资源列表但不返回
                        try {
                            const result = await client.listResources();
                            connectionManager.updateConnectionData(connectionId, {
                                resources: result.resources || []
                            });
                        } catch (error) {
                            console.error("Failed to refresh resources:", error);
                        }
                    },
                    refreshPrompts: async () => {
                        // 刷新提示列表但不返回
                        try {
                            const result = await client.listPrompts();
                            connectionManager.updateConnectionData(connectionId, {
                                prompts: result.prompts || []
                            });
                        } catch (error) {
                            console.error("Failed to refresh prompts:", error);
                        }
                    }
                };

                // 保存客户端实例
                setActiveClients(prev => new Map(prev).set(connectionId, clientWrapper));
                results.successful++;

            } catch (error) {
                console.error(`❌ 连接失败: ${config.name}`, error);
                
                // 如果连接记录已创建，更新状态为错误
                const existingConnectionId = results.connectionIds[results.connectionIds.length - 1];
                if (existingConnectionId) {
                    const errorMessage = error instanceof Error ? error.message : "连接失败";
                    connectionManager.updateConnectionStatus(existingConnectionId, "error", errorMessage);
                }
                
                results.failed++;
            }
        }

        console.log(`🎉 导入完成! 成功连接: ${results.successful}个, 失败: ${results.failed}个`);
        return results;
    }, [connectionManager]);

    // 获取指定连接的客户端实例
    const getClient = useCallback((connectionId: string) => {
        return activeClients.get(connectionId);
    }, [activeClients]);

    // 获取所有工具（跨连接聚合）
    const getAllTools = useMemo(() => {
        return connections.flatMap(connection =>
            connection.tools.map(tool => ({
                ...tool,
                connectionId: connection.id,
                connectionName: connection.config.name
            }))
        );
    }, [connections]);

    return {
        // 连接管理
        connections,
        isLoading,
        error,
        connectToServer,
        connectWithClient,
        disconnectFromServer,
        removeConnection,
        importServers,
        importAndConnectServers,

        // 客户端访问
        getClient,
        activeClients,

        // 数据聚合（便捷方法）
        getAllTools,

        // 底层访问
        getConnection: connectionManager.getConnection.bind(connectionManager),
        getTools: connectionManager.getTools.bind(connectionManager),
    };
}

