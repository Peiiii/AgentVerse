import { useMemo } from 'react';
import { useMCPServerStore } from '@/core/stores/mcp-server.store';
import type { ToolDefinition, ToolExecutor } from '@agent-labs/agent-chat';

/**
 * 将MCP工具转换为@agent-labs/agent-chat需要的格式
 * 
 * 这个hook避免了耦合和重复实现，通过适配器模式将MCP工具转换为agent-chat需要的格式
 */
export function useAllTools() {
  const store = useMCPServerStore();

  // 转换MCP工具为ToolDefinition格式
  const toolDefinitions = useMemo(() => {
    const mcpTools = store.getAllTools();
    
    return mcpTools.map(({ serverId, serverName, tool }) => {
      const toolObj = tool as { name: string; description?: string; inputSchema?: unknown };
      // 创建唯一的工具名称，避免冲突
      const toolName = `${serverName}-${toolObj.name}`;
      
      // 转换MCP工具参数为JSON Schema格式
      const parameters = {
        type: 'object' as const,
        properties: {} as Record<string, unknown>,
        required: [] as string[],
      };

      // 处理MCP工具的输入schema
      if (toolObj.inputSchema) {
        const inputSchema = toolObj.inputSchema as { type?: string; properties?: unknown; required?: string[] };
        if (inputSchema.type === 'object' && inputSchema.properties) {
          parameters.properties = inputSchema.properties as Record<string, unknown>;
          parameters.required = inputSchema.required || [];
        } else {
          // 如果MCP工具没有详细的schema，创建一个通用的参数
          parameters.properties = {
            args: {
              type: 'string',
              description: '工具参数（JSON格式）',
            },
          };
          parameters.required = ['args'];
        }
      } else {
        // 默认参数
        parameters.properties = {
          args: {
            type: 'string',
            description: '工具参数（JSON格式）',
          },
        };
        parameters.required = ['args'];
      }

      return {
        name: toolName,
        description: `${toolObj.description || toolObj.name} (来自 ${serverName})`,
        parameters,
        // 添加元数据，便于后续处理
        metadata: {
          serverId,
          serverName,
          originalToolName: toolObj.name,
          mcpTool: tool,
        },
      } as ToolDefinition & { metadata: unknown };
    });
  }, [store, store.connections]); // 加入 store

  // 创建工具执行器
  const toolExecutors = useMemo(() => {
    const executors: Record<string, ToolExecutor> = {};
    
    const mcpTools = store.getAllTools();
    
    mcpTools.forEach(({ serverId, serverName, tool }) => {
      const toolObj = tool as { name: string; description?: string };
      const toolName = `${serverName}-${toolObj.name}`;
      
      executors[toolName] = async (toolCall) => {
        try {
          // 获取连接
          const connection = store.getConnection(serverId);
          if (!connection?.client) {
            throw new Error(`MCP服务器 ${serverName} 未连接`);
          }

          // 解析参数
          const args = JSON.parse(toolCall.function.arguments);
          
          // 调用MCP工具
          const result = await connection.client.callTool({
            name: toolObj.name,
            arguments: args.args ? JSON.parse(args.args) : args,
          });

          return {
            toolCallId: toolCall.id,
            result: {
              success: true,
              data: result,
              serverName,
              toolName: toolObj.name,
            },
            status: 'success' as const,
          };
        } catch (error) {
          console.error(`MCP工具执行失败: ${toolObj.name}`, error);
          
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              error: error instanceof Error ? error.message : '执行失败',
              serverName,
              toolName: toolObj.name,
            },
            status: 'error' as const,
          };
        }
      };
    });

    return executors;
  }, [store, store.connections]); // 直接依赖connections状态

  // 统计信息
  const stats = useMemo(() => {
    const mcpTools = store.getAllTools();
    return {
      totalTools: mcpTools.length,
      servers: [...new Set(mcpTools.map(t => t.serverName))],
      toolsByServer: mcpTools.reduce((acc, { serverName, tool }) => {
        const toolObj = tool as { name: string };
        if (!acc[serverName]) acc[serverName] = [];
        acc[serverName].push(toolObj.name);
        return acc;
      }, {} as Record<string, string[]>),
    };
  }, [store, store.connections]); // 加入 store

  return {
    // 工具定义，可直接传递给@agent-labs/agent-chat
    toolDefinitions,
    // 工具执行器，可直接传递给@agent-labs/agent-chat
    toolExecutors,
    // 统计信息
    stats,
    // 原始MCP工具数据
    mcpTools: store.getAllTools(),
  };
} 