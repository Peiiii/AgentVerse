import { useCallback, useMemo } from 'react';
import { useMCPServerStore, type MCPServerConfig } from '@/core/stores/mcp-server.store';

/**
 * MCP服务器管理Hook
 * 
 * 提供简洁的API来管理MCP服务器列表和连接
 */
export function useMCPServers() {
  const store = useMCPServerStore();

  // 服务器列表
  const servers = store.servers;
  const connections = store.connections;

  // 连接状态统计
  const stats = useMemo(() => {
    const connected = Array.from(connections.values()).filter(conn => conn.status === 'connected').length;
    const total = connections.size;
    const totalTools = Array.from(connections.values()).reduce((sum, conn) => sum + conn.tools.length, 0);
    const totalResources = Array.from(connections.values()).reduce((sum, conn) => sum + conn.resources.length, 0);
    const totalPrompts = Array.from(connections.values()).reduce((sum, conn) => sum + conn.prompts.length, 0);

    return {
      connected,
      total,
      totalTools,
      totalResources,
      totalPrompts,
    };
  }, [connections]);

  // 添加服务器
  const addServer = useCallback((config: Omit<MCPServerConfig, 'id'>) => {
    return store.addServer(config);
  }, [store]);

  // 更新服务器
  const updateServer = useCallback((id: string, updates: Partial<MCPServerConfig>) => {
    store.updateServer(id, updates);
  }, [store]);

  // 删除服务器
  const removeServer = useCallback((id: string) => {
    store.removeServer(id);
  }, [store]);

  // 导入服务器
  const importServers = useCallback((configs: Omit<MCPServerConfig, 'id'>[]) => {
    return store.importServers(configs);
  }, [store]);

  // 连接服务器
  const connectServer = useCallback(async (serverId: string) => {
    await store.connect(serverId);
  }, [store]);

  // 断开服务器
  const disconnectServer = useCallback(async (serverId: string) => {
    await store.disconnect(serverId);
  }, [store]);

  // 刷新工具
  const refreshTools = useCallback(async (serverId: string) => {
    await store.refreshTools(serverId);
  }, [store]);

  // 获取连接
  const getConnection = useCallback((serverId: string) => {
    return store.getConnection(serverId);
  }, [store]);

  // 获取所有工具
  const getAllTools = useCallback(() => {
    return store.getAllTools();
  }, [store]);

  // 获取已连接的服务器
  const getConnectedServers = useCallback(() => {
    return store.getConnectedServers();
  }, [store]);

  // 检查服务器是否已连接
  const isConnected = useCallback((serverId: string) => {
    return store.isConnected(serverId);
  }, [store]);

  // 获取服务器状态
  const getServerStatus = useCallback((serverId: string) => {
    return store.getServerStatus(serverId);
  }, [store]);

  return {
    // 数据
    servers,
    connections,
    stats,
    
    // 服务器管理
    addServer,
    updateServer,
    removeServer,
    importServers,
    
    // 连接管理
    connectServer,
    disconnectServer,
    refreshTools,
    
    // 查询方法
    getConnection,
    getAllTools,
    getConnectedServers,
    isConnected,
    getServerStatus,
  };
} 