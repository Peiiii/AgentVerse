// 浏览器兼容的EventEmitter实现
class BrowserEventEmitter {
    private events: Record<string, Function[]> = {};

    on(event: string, listener: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event: string, ...args: any[]): void {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }

    removeAllListeners(): void {
        this.events = {};
    }
}

export interface MCPServerConfig {
    name: string;
    url: string;
    transport?: "stdio" | "tcp" | "websocket";
    credentials?: {
        token?: string;
        username?: string;
        password?: string;
    };
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface MCPConnection {
    id: string;
    config: MCPServerConfig;
    tools: MCPTool[];
    isConnected: boolean;
    lastConnected?: Date;
    error?: string;
}

export interface MCPToolCall {
    toolName: string;
    arguments: Record<string, any>;
}

export interface MCPToolResult {
    success: boolean;
    result?: any;
    error?: string;
}

export class MCPConnectionManager extends BrowserEventEmitter {
    private connections = new Map<string, MCPConnection>();
    private connectionHandlers = new Map<string, WebSocket | null>();

    /**
     * 连接到MCP服务器
     */
    async connect(config: MCPServerConfig): Promise<string> {
        const connectionId = this.generateConnectionId(config);

        if (this.connections.has(connectionId)) {
            throw new Error(`Connection to ${config.name} already exists`);
        }

        const connection: MCPConnection = {
            id: connectionId,
            config,
            tools: [],
            isConnected: false,
        };

        this.connections.set(connectionId, connection);
        this.emit("connectionCreated", connection);

        try {
            await this.establishConnection(connection);
            return connectionId;
        } catch (error) {
            connection.error = error instanceof Error ? error.message : "Unknown error";
            connection.isConnected = false;
            this.emit("connectionFailed", connection, error);
            throw error;
        }
    }

    /**
     * 断开MCP服务器连接
     */
    async disconnect(connectionId: string): Promise<void> {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        const handler = this.connectionHandlers.get(connectionId);
        if (handler) {
            handler.close();
            this.connectionHandlers.delete(connectionId);
        }

        connection.isConnected = false;
        this.connections.delete(connectionId);
        this.emit("connectionDisconnected", connection);
    }

    /**
     * 获取所有连接
     */
    getConnections(): MCPConnection[] {
        return Array.from(this.connections.values());
    }

    /**
     * 获取指定连接
     */
    getConnection(connectionId: string): MCPConnection | undefined {
        return this.connections.get(connectionId);
    }

    /**
     * 执行MCP工具
     */
    async executeTool(connectionId: string, toolCall: MCPToolCall): Promise<MCPToolResult> {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        if (!connection.isConnected) {
            throw new Error(`Connection ${connectionId} is not connected`);
        }

        const handler = this.connectionHandlers.get(connectionId);
        if (!handler) {
            throw new Error(`Connection handler for ${connectionId} not found`);
        }

        try {
            // 发送工具调用请求
            const request = {
                jsonrpc: "2.0",
                id: this.generateRequestId(),
                method: "tools/call",
                params: {
                    name: toolCall.toolName,
                    arguments: toolCall.arguments,
                },
            };

            handler.send(JSON.stringify(request));

            // 等待响应
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Tool execution timeout"));
                }, 30000);

                const handleResponse = (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data);
                        if (response.id === request.id) {
                            clearTimeout(timeout);
                            handler.removeEventListener("message", handleResponse);

                            if (response.error) {
                                resolve({
                                    success: false,
                                    error: response.error.message || "Tool execution failed",
                                });
                            } else {
                                resolve({
                                    success: true,
                                    result: response.result,
                                });
                            }
                        }
                    } catch (error) {
                        // 忽略非JSON消息
                    }
                };

                handler.addEventListener("message", handleResponse);
            });
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * 获取连接的工具列表
     */
    getTools(connectionId: string): MCPTool[] {
        const connection = this.connections.get(connectionId);
        return connection?.tools || [];
    }

    /**
     * 建立连接
     */
    private async establishConnection(connection: MCPConnection): Promise<void> {
        const { config } = connection;

        if (config.transport === "websocket" || config.url.startsWith("ws")) {
            await this.connectWebSocket(connection);
        } else if (config.transport === "tcp" || config.url.startsWith("tcp")) {
            await this.connectTCP(connection);
        } else {
            // 默认使用WebSocket
            await this.connectWebSocket(connection);
        }
    }

    /**
     * WebSocket连接
     */
    private async connectWebSocket(connection: MCPConnection): Promise<void> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(connection.config.url);

            ws.onopen = () => {
                connection.isConnected = true;
                connection.lastConnected = new Date();
                connection.error = undefined;
                this.connectionHandlers.set(connection.id, ws);

                // 获取工具列表
                this.requestTools(connection);

                this.emit("connectionEstablished", connection);
                resolve();
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(connection, message);
                } catch (error) {
                    console.error("Failed to parse MCP message:", error);
                }
            };

            ws.onerror = (error) => {
                connection.error = "WebSocket connection failed";
                this.emit("connectionError", connection, error);
                reject(new Error("WebSocket connection failed"));
            };

            ws.onclose = () => {
                connection.isConnected = false;
                this.connectionHandlers.delete(connection.id);
                this.emit("connectionClosed", connection);
            };
        });
    }

    /**
     * TCP连接（暂未实现，需要Node.js环境）
     */
    private async connectTCP(_connection: MCPConnection): Promise<void> {
        throw new Error("TCP transport not implemented in browser environment");
    }

    /**
     * 请求工具列表
     */
    private requestTools(connection: MCPConnection): void {
        const handler = this.connectionHandlers.get(connection.id);
        if (!handler) return;

        const request = {
            jsonrpc: "2.0",
            id: this.generateRequestId(),
            method: "tools/list",
            params: {},
        };

        handler.send(JSON.stringify(request));
    }

    /**
     * 处理MCP消息
     */
    private handleMessage(connection: MCPConnection, message: any): void {
        if (message.method === "tools/list") {
            connection.tools = message.params?.tools || [];
            this.emit("toolsUpdated", connection);
        }
    }

    /**
     * 生成连接ID
     */
    private generateConnectionId(config: MCPServerConfig): string {
        return `${config.name}-${Date.now()}`;
    }

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 清理所有连接
     */
    dispose(): void {
        for (const connectionId of this.connections.keys()) {
            this.disconnect(connectionId);
        }
        this.connections.clear();
        this.connectionHandlers.clear();
    }
} 