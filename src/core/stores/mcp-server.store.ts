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
  // 服务器列表 - 只持久化这个
  servers: MCPServerConfig[];
  
  // 运行时状态 - 不持久化
  connections: Map<string, MCPServerConnection>;
  
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
  isConnected: (serverId: string) => boolean;
  getServerStatus: (serverId: string) => 'disconnected' | 'connecting' | 'connected' | 'error';
  
  // 内部方法
  getConnectionsMap: () => Map<string, MCPServerConnection>;
}

export const useMCPServerStore = create<MCPServerState>()(
  persist(
    (set, get) => ({
      servers: [],
      connections: new Map(),

      addServer: (config) => {
        const id = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const serverConfig: MCPServerConfig = { ...config, id };
        
        set((state) => {
          const newConnections = new Map(state.connections);
          newConnections.set(id, {
            config: serverConfig,
            status: 'disconnected',
            tools: [],
            resources: [],
            prompts: [],
          });
          
          return {
            servers: [...state.servers, serverConfig],
            connections: newConnections,
          };
        });
        
        return id;
      },

      updateServer: (id, updates) => {
        set((state) => {
          const updatedServers = state.servers.map(server =>
            server.id === id ? { ...server, ...updates } : server
          );
          
          const newConnections = new Map(state.connections);
          const existingConnection = newConnections.get(id);
          if (existingConnection) {
            newConnections.set(id, {
              ...existingConnection,
              config: { ...existingConnection.config, ...updates }
            });
          }
          
          return { 
            servers: updatedServers, 
            connections: newConnections 
          };
        });
      },

      removeServer: (id) => {
        set((state) => {
          const connection = state.connections.get(id);
          if (connection?.client) {
            connection.client.close().catch(console.error);
          }
          
          const newConnections = new Map(state.connections);
          newConnections.delete(id);
          
          return {
            servers: state.servers.filter(server => server.id !== id),
            connections: newConnections,
          };
        });
      },

      importServers: (configs) => {
        const ids: string[] = [];
        set((state) => {
          const newServers = [...state.servers];
          const newConnections = new Map(state.connections);
          
          configs.forEach(config => {
            const id = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const serverConfig: MCPServerConfig = { ...config, id };
            ids.push(id);
            
            newServers.push(serverConfig);
            newConnections.set(id, {
              config: serverConfig,
              status: 'disconnected',
              tools: [],
              resources: [],
              prompts: [],
            });
          });
          
          return { servers: newServers, connections: newConnections };
        });
        
        return ids;
      },

      connect: async (serverId) => {
        const state = get();
        const connection = state.connections.get(serverId);
        if (!connection) throw new Error(`Server ${serverId} not found`);

        // 更新状态为连接中
        set((state) => {
          const newConnections = new Map(state.connections);
          const existingConnection = newConnections.get(serverId);
          if (existingConnection) {
            newConnections.set(serverId, {
              ...existingConnection,
              status: 'connecting',
              error: undefined
            });
          }
          return { connections: newConnections };
        });

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
          set((state) => {
            const newConnections = new Map(state.connections);
            const existingConnection = newConnections.get(serverId);
            if (existingConnection) {
              newConnections.set(serverId, {
                ...existingConnection,
                status: 'connected',
                client,
                tools: toolsResult.tools || [],
                resources: resourcesResult.resources || [],
                prompts: promptsResult.prompts || [],
                lastConnected: new Date(),
                error: undefined,
              });
            }
            return { connections: newConnections };
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '连接失败';
          
          set((state) => {
            const newConnections = new Map(state.connections);
            const existingConnection = newConnections.get(serverId);
            if (existingConnection) {
              newConnections.set(serverId, {
                ...existingConnection,
                status: 'error',
                error: errorMessage
              });
            }
            return { connections: newConnections };
          });
          
          throw error;
        }
      },

      disconnect: async (serverId) => {
        const state = get();
        const connection = state.connections.get(serverId);
        if (!connection) return;

        try {
          if (connection.client) {
            await connection.client.close();
          }
        } catch (error) {
          console.warn('Error closing client:', error);
        }

        set((state) => {
          const newConnections = new Map(state.connections);
          const existingConnection = newConnections.get(serverId);
          if (existingConnection) {
            newConnections.set(serverId, {
              ...existingConnection,
              status: 'disconnected',
              client: undefined,
              tools: [],
              resources: [],
              prompts: [],
              error: undefined,
            });
          }
          return { connections: newConnections };
        });
      },

      refreshTools: async (serverId) => {
        const state = get();
        const connection = state.connections.get(serverId);
        if (!connection) throw new Error(`Server ${serverId} not found`);
        
        if (!connection.client || connection.status !== 'connected') {
          throw new Error('Server not connected');
        }

        try {
          const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
            connection.client.listTools().catch(() => ({ tools: [] })),
            connection.client.listResources().catch(() => ({ resources: [] })),
            connection.client.listPrompts().catch(() => ({ prompts: [] })),
          ]);

          set((state) => {
            const newConnections = new Map(state.connections);
            const existingConnection = newConnections.get(serverId);
            if (existingConnection) {
              newConnections.set(serverId, {
                ...existingConnection,
                tools: toolsResult.tools || [],
                resources: resourcesResult.resources || [],
                prompts: promptsResult.prompts || [],
              });
            }
            return { connections: newConnections };
          });
        } catch (error) {
          console.error('Failed to refresh tools:', error);
          throw error;
        }
      },

      getConnection: (serverId) => {
        const state = get();
        return state.connections.get(serverId);
      },

      getAllTools: () => {
        const state = get();
        const allTools: Array<{ serverId: string; serverName: string; tool: any }> = [];
        
        state.connections.forEach((connection, serverId) => {
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
          const connection = state.connections.get(server.id);
          return connection?.status === 'connected';
        });
      },

      isConnected: (serverId) => {
        const state = get();
        const connection = state.connections.get(serverId);
        return connection?.status === 'connected';
      },

      getServerStatus: (serverId) => {
        const state = get();
        const connection = state.connections.get(serverId);
        return connection?.status || 'disconnected';
      },

      getConnectionsMap: () => {
        const state = get();
        return state.connections;
      },
    }),
    {
      name: 'mcp-server-store',
      // 只持久化servers数组，不持久化connections
      partialize: (state) => ({ servers: state.servers }),
      // 页面加载时，为每个服务器初始化连接状态
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 为每个服务器创建初始连接状态
          const newConnections = new Map();
          state.servers.forEach(server => {
            newConnections.set(server.id, {
              config: server,
              status: 'disconnected',
              tools: [],
              resources: [],
              prompts: [],
            });
          });
          state.connections = newConnections;
        }
      },
    }
  )
); 