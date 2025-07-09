import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  type: 'sse' | 'http';
  description?: string;
}

export interface MCPServerConnection {
  config: MCPServerConfig;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error?: string;
  tools: any[];
  resources: any[];
  prompts: any[];
  lastConnected?: Date;
  client?: Client;
}

export interface MCPServerState {
  // 服务器列表
  servers: MCPServerConfig[];
  // 连接状态 - 使用数组而不是Map以便序列化
  connections: Array<[string, MCPServerConnection]>;
  
  // 服务器管理
  addServer: (config: Omit<MCPServerConfig, 'id'>) => string;
  updateServer: (id: string, updates: Partial<MCPServerConfig>) => void;
  removeServer: (id: string) => void;
  importServers: (configs: Omit<MCPServerConfig, 'id'>[]) => string[];
  
  // 连接管理
  connect: (serverId: string) => Promise<void>;
  disconnect: (serverId: string) => Promise<void>;
  refreshTools: (serverId: string) => Promise<void>;
  
  // 获取数据
  getConnection: (serverId: string) => MCPServerConnection | undefined;
  getAllTools: () => Array<{ serverId: string; serverName: string; tool: any }>;
  getConnectedServers: () => MCPServerConfig[];
  
  // 内部方法
  getConnectionsMap: () => Map<string, MCPServerConnection>;
}

export const useMCPServerStore = create<MCPServerState>()(
  persist(
    (set, get) => ({
      servers: [],
      connections: [],

      addServer: (config) => {
        const id = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const serverConfig: MCPServerConfig = { ...config, id };
        
        set((state) => ({
          servers: [...state.servers, serverConfig],
          connections: [...state.connections, [id, {
            config: serverConfig,
            status: 'disconnected',
            tools: [],
            resources: [],
            prompts: [],
          }]],
        }));
        
        return id;
      },

      updateServer: (id, updates) => {
        set((state) => {
          const updatedServers = state.servers.map(server =>
            server.id === id ? { ...server, ...updates } : server
          );
          
          const updatedConnections = state.connections.map(([connId, connection]) =>
            connId === id 
              ? [connId, { ...connection, config: { ...connection.config, ...updates } }] as [string, MCPServerConnection]
              : [connId, connection] as [string, MCPServerConnection]
          );
          
          return { servers: updatedServers, connections: updatedConnections };
        });
      },

      removeServer: (id) => {
        set((state) => {
          const connection = state.connections.find(([connId]) => connId === id)?.[1];
          if (connection?.client) {
            connection.client.close().catch(console.error);
          }
          
          return {
            servers: state.servers.filter(server => server.id !== id),
            connections: state.connections.filter(([connId]) => connId !== id),
          };
        });
      },

      importServers: (configs) => {
        const ids: string[] = [];
        set((state) => {
          const newServers = [...state.servers];
          const newConnections = [...state.connections];
          
          configs.forEach(config => {
            const id = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const serverConfig: MCPServerConfig = { ...config, id };
            ids.push(id);
            
            newServers.push(serverConfig);
            newConnections.push([id, {
              config: serverConfig,
              status: 'disconnected',
              tools: [],
              resources: [],
              prompts: [],
            }]);
          });
          
          return { servers: newServers, connections: newConnections };
        });
        
        return ids;
      },

      connect: async (serverId) => {
        const state = get();
        const connectionEntry = state.connections.find(([id]) => id === serverId);
        if (!connectionEntry) throw new Error(`Server ${serverId} not found`);
        
        const [, connection] = connectionEntry;

        // 更新状态为连接中
        set((state) => ({
          connections: state.connections.map(([id, conn]) =>
            id === serverId 
              ? [id, { ...conn, status: 'connecting', error: undefined }]
              : [id, conn]
          ),
        }));

        try {
          // 创建客户端
          const client = new Client({
            name: 'agentverse-mcp-client',
            version: '1.0.0',
          });

          // 选择传输协议
          let transport: SSEClientTransport | StreamableHTTPClientTransport;
          if (connection.config.type === 'sse') {
            transport = new SSEClientTransport(new URL(connection.config.url));
          } else {
            transport = new StreamableHTTPClientTransport(new URL(connection.config.url));
          }

          // 连接
          await client.connect(transport);

          // 获取工具、资源、提示
          const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
            client.listTools().catch(() => ({ tools: [] })),
            client.listResources().catch(() => ({ resources: [] })),
            client.listPrompts().catch(() => ({ prompts: [] })),
          ]);

          // 更新连接状态
          set((state) => ({
            connections: state.connections.map(([id, conn]) =>
              id === serverId 
                ? [id, {
                    ...conn,
                    status: 'connected',
                    client,
                    tools: toolsResult.tools || [],
                    resources: resourcesResult.resources || [],
                    prompts: promptsResult.prompts || [],
                    lastConnected: new Date(),
                    error: undefined,
                  }]
                : [id, conn]
            ),
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '连接失败';
          
          set((state) => ({
            connections: state.connections.map(([id, conn]) =>
              id === serverId 
                ? [id, { ...conn, status: 'error', error: errorMessage }]
                : [id, conn]
            ),
          }));
          
          throw error;
        }
      },

      disconnect: async (serverId) => {
        const state = get();
        const connectionEntry = state.connections.find(([id]) => id === serverId);
        if (!connectionEntry) return;
        
        const [, connection] = connectionEntry;

        try {
          if (connection.client) {
            await connection.client.close();
          }
        } catch (error) {
          console.warn('Error closing client:', error);
        }

        set((state) => ({
          connections: state.connections.map(([id, conn]) =>
            id === serverId 
              ? [id, {
                  ...conn,
                  status: 'disconnected',
                  client: undefined,
                  tools: [],
                  resources: [],
                  prompts: [],
                  error: undefined,
                }]
              : [id, conn]
          ),
        }));
      },

      refreshTools: async (serverId) => {
        const state = get();
        const connectionEntry = state.connections.find(([id]) => id === serverId);
        if (!connectionEntry) throw new Error(`Server ${serverId} not found`);
        
        const [, connection] = connectionEntry;
        if (!connection.client || connection.status !== 'connected') {
          throw new Error('Server not connected');
        }

        try {
          const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
            connection.client.listTools().catch(() => ({ tools: [] })),
            connection.client.listResources().catch(() => ({ resources: [] })),
            connection.client.listPrompts().catch(() => ({ prompts: [] })),
          ]);

          set((state) => ({
            connections: state.connections.map(([id, conn]) =>
              id === serverId 
                ? [id, {
                    ...conn,
                    tools: toolsResult.tools || [],
                    resources: resourcesResult.resources || [],
                    prompts: promptsResult.prompts || [],
                  }]
                : [id, conn]
            ),
          }));
        } catch (error) {
          console.error('Failed to refresh tools:', error);
          throw error;
        }
      },

      getConnection: (serverId) => {
        const state = get();
        return state.connections.find(([id]) => id === serverId)?.[1];
      },

      getAllTools: () => {
        const state = get();
        const allTools: Array<{ serverId: string; serverName: string; tool: any }> = [];
        
        state.connections.forEach(([serverId, connection]) => {
          if (connection.status === 'connected') {
            connection.tools.forEach(tool => {
              allTools.push({
                serverId,
                serverName: connection.config.name,
                tool,
              });
            });
          }
        });
        
        return allTools;
      },

      getConnectedServers: () => {
        const state = get();
        return state.servers.filter(server => {
          const connection = state.connections.find(([id]) => id === server.id)?.[1];
          return connection?.status === 'connected';
        });
      },

      getConnectionsMap: () => {
        const state = get();
        return new Map(state.connections);
      },
    }),
    {
      name: 'mcp-server-store',
    }
  )
); 