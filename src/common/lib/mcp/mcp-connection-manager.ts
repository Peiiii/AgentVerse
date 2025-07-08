import { useMCPClient, type MCPTool, type MCPResource, type MCPPrompt, type MCPConnectionStatus } from "@/common/hooks/use-mcp-client";

export interface MCPServerConfig {
  name: string;
  url: string;
  type?: "sse" | "http" | "websocket" | "tcp";
}

export interface MCPConnection {
  id: string;
  config: MCPServerConfig;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  status: MCPConnectionStatus;
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

/**
 * 基于官方SDK的MCP连接管理器
 * 这个类现在主要作为状态管理和批量连接的封装
 */
export class MCPConnectionManager {
  private connections = new Map<string, MCPConnection>();
  private clientInstances = new Map<string, ReturnType<typeof useMCPClient>>();

  /**
   * 创建新的MCP连接
   */
  async createConnection(config: MCPServerConfig): Promise<string> {
    const connectionId = this.generateConnectionId(config);

    if (this.connections.has(connectionId)) {
      throw new Error(`Connection to ${config.name} already exists`);
    }

    // 创建连接记录
    const connection: MCPConnection = {
      id: connectionId,
      config,
      tools: [],
      resources: [],
      prompts: [],
      status: "disconnected",
    };

    this.connections.set(connectionId, connection);
    return connectionId;
  }

  /**
   * 连接到MCP服务器
   */
  async connect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    // 这里需要在React组件中使用useMCPClient hook
    // 因为hooks不能在类中直接使用，所以这个方法需要被重构
    throw new Error("This method should be called from a React component using useMCPClient hook");
  }

  /**
   * 断开连接
   */
  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const clientInstance = this.clientInstances.get(connectionId);
    if (clientInstance) {
      await clientInstance.disconnect();
      this.clientInstances.delete(connectionId);
    }

    connection.status = "disconnected";
    connection.tools = [];
    connection.resources = [];
    connection.prompts = [];
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
   * 获取连接的工具列表
   */
  getTools(connectionId: string): MCPTool[] {
    const connection = this.connections.get(connectionId);
    return connection?.tools || [];
  }

  /**
   * 更新连接状态
   */
  updateConnectionStatus(connectionId: string, status: MCPConnectionStatus, error?: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = status;
      connection.error = error;
      if (status === "connected") {
        connection.lastConnected = new Date();
      }
    }
  }

  /**
   * 更新连接的工具、资源和提示
   */
  updateConnectionData(
    connectionId: string, 
    data: { 
      tools?: MCPTool[], 
      resources?: MCPResource[], 
      prompts?: MCPPrompt[] 
    }
  ): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      if (data.tools) connection.tools = data.tools;
      if (data.resources) connection.resources = data.resources;
      if (data.prompts) connection.prompts = data.prompts;
    }
  }

  /**
   * 删除连接
   */
  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
    this.clientInstances.delete(connectionId);
  }

  /**
   * 批量导入服务器配置
   */
  async importServers(configList: MCPServerConfig[]): Promise<string[]> {
    const connectionIds: string[] = [];

    for (const config of configList) {
      try {
        const connectionId = await this.createConnection(config);
        connectionIds.push(connectionId);
      } catch (error) {
        console.error(`Failed to create connection for ${config.name}:`, error);
      }
    }

    return connectionIds;
  }

  /**
   * 生成连接ID
   */
  private generateConnectionId(config: MCPServerConfig): string {
    return `${config.name}-${Date.now()}`;
  }
} 