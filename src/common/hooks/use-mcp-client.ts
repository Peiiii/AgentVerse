import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export type MCPConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface MCPResource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: any[];
}

export interface MCPClientHookResult {
  client: Client | null;
  status: MCPConnectionStatus;
  error: string | null;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  connect: (url: string, transport?: "http" | "sse") => Promise<void>;
  disconnect: () => Promise<void>;
  // 移除不必要的包装方法，直接使用 client.callTool, client.getPrompt, client.readResource
  refreshTools: () => Promise<void>;
  refreshResources: () => Promise<void>;
  refreshPrompts: () => Promise<void>;
}

/**
 * MCP Client Hook - 使用官方SDK管理MCP连接
 * 
 * 设计原则：
 * - 负责连接管理和状态维护
 * - 暴露原生client实例供直接调用
 * - 避免不必要的方法包装
 */
export function useMCPClient(): MCPClientHookResult {
  const [client, setClient] = useState<Client | null>(null);
  const [status, setStatus] = useState<MCPConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [prompts, setPrompts] = useState<MCPPrompt[]>([]);
  
  const transportRef = useRef<StreamableHTTPClientTransport | SSEClientTransport | null>(null);

  // 连接到MCP服务器
  const connect = useCallback(async (url: string, transport: "http" | "sse" = "http") => {
    try {
      setStatus("connecting");
      setError(null);

      // 创建客户端
      const newClient = new Client({
        name: "agentverse-mcp-client",
        version: "1.0.0"
      });

      let clientTransport: StreamableHTTPClientTransport | SSEClientTransport;

      // 根据指定的传输协议类型创建对应的Transport
      if (transport === "sse") {
        console.log(`使用SSE传输协议连接到: ${url}`);
        clientTransport = new SSEClientTransport(new URL(url));
      } else {
        console.log(`使用HTTP传输协议连接到: ${url}`);
        clientTransport = new StreamableHTTPClientTransport(new URL(url));
      }

      // 连接到服务器
      await newClient.connect(clientTransport);

      transportRef.current = clientTransport;
      setClient(newClient);
      setStatus("connected");

      console.log(`成功连接到MCP服务器，使用${transport}协议`);

      // 自动加载工具、资源和提示
      await Promise.all([
        loadTools(newClient),
        loadResources(newClient),
        loadPrompts(newClient)
      ]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "连接失败";
      console.error(`MCP连接失败 (${transport}):`, err);
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(async () => {
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.warn("Error closing client:", err);
      }
    }
    
    setClient(null);
    setStatus("disconnected");
    setError(null);
    setTools([]);
    setResources([]);
    setPrompts([]);
    transportRef.current = null;
  }, [client]);

  // 加载工具列表
  const loadTools = useCallback(async (clientInstance?: Client) => {
    const targetClient = clientInstance || client;
    if (!targetClient) return;

    try {
      const result = await targetClient.listTools();
      setTools(result.tools || []);
    } catch (err) {
      console.error("Failed to load tools:", err);
      setTools([]);
    }
  }, [client]);

  // 加载资源列表
  const loadResources = useCallback(async (clientInstance?: Client) => {
    const targetClient = clientInstance || client;
    if (!targetClient) return;

    try {
      const result = await targetClient.listResources();
      setResources(result.resources || []);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setResources([]);
    }
  }, [client]);

  // 加载提示列表
  const loadPrompts = useCallback(async (clientInstance?: Client) => {
    const targetClient = clientInstance || client;
    if (!targetClient) return;

    try {
      const result = await targetClient.listPrompts();
      setPrompts(result.prompts || []);
    } catch (err) {
      console.error("Failed to load prompts:", err);
      setPrompts([]);
    }
  }, [client]);

  // 刷新数据的便捷方法
  const refreshTools = useCallback(() => loadTools(), [loadTools]);
  const refreshResources = useCallback(() => loadResources(), [loadResources]);
  const refreshPrompts = useCallback(() => loadPrompts(), [loadPrompts]);

  // 清理连接
  useEffect(() => {
    return () => {
      if (client) {
        client.close().catch(console.warn);
      }
    };
  }, [client]);

  return {
    client, // 直接暴露原生客户端，使用者可以调用 client.callTool, client.getPrompt 等
    status,
    error,
    tools,
    resources,
    prompts,
    connect,
    disconnect,
    refreshTools,
    refreshResources,
    refreshPrompts
  };
} 