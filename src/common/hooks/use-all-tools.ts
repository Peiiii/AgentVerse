import { useMemo } from 'react';
import { useMCPServers } from './use-mcp-servers';
import type { ToolDefinition, ToolExecutor } from '@agent-labs/agent-chat';

/**
 * 将MCP工具转换为@agent-labs/agent-chat需要的格式
 * 
 * 这个hook避免了耦合和重复实现，通过适配器模式将MCP工具转换为agent-chat需要的格式
 */
export function useAllTools() {
  const { getAllTools, getConnection } = useMCPServers();

  // 转换MCP工具为ToolDefinition格式
  const toolDefinitions = useMemo(() => {
    const mcpTools = getAllTools();
    
    return mcpTools.map(({ serverId, serverName, tool }) => {
      // 创建唯一的工具名称，避免冲突
      const toolName = `${serverName}-${tool.name}`;
      
      // 转换MCP工具参数为JSON Schema格式
      const parameters = {
        type: 'object' as const,
        properties: {} as Record<string, any>,
        required: [] as string[],
      };

      // 处理MCP工具的输入schema
      if (tool.inputSchema) {
        if (tool.inputSchema.type === 'object' && tool.inputSchema.properties) {
          parameters.properties = tool.inputSchema.properties;
          parameters.required = tool.inputSchema.required || [];
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
        description: `${tool.description || tool.name} (来自 ${serverName})`,
        parameters,
        // 添加元数据，便于后续处理
        metadata: {
          serverId,
          serverName,
          originalToolName: tool.name,
          mcpTool: tool,
        },
      } as ToolDefinition & { metadata: any };
    });
  }, [getAllTools]);

  // 创建工具执行器
  const toolExecutors = useMemo(() => {
    const executors: Record<string, ToolExecutor> = {};
    
    const mcpTools = getAllTools();
    
    mcpTools.forEach(({ serverId, serverName, tool }) => {
      const toolName = `${serverName}-${tool.name}`;
      
      executors[toolName] = async (toolCall) => {
        try {
          // 获取连接
          const connection = getConnection(serverId);
          if (!connection?.client) {
            throw new Error(`MCP服务器 ${serverName} 未连接`);
          }

          // 解析参数
          const args = JSON.parse(toolCall.function.arguments);
          
          // 调用MCP工具
          const result = await connection.client.callTool({
            name: tool.name,
            arguments: args.args ? JSON.parse(args.args) : args,
          });

          return {
            toolCallId: toolCall.id,
            result: {
              success: true,
              data: result,
              serverName,
              toolName: tool.name,
            },
            status: 'success' as const,
          };
        } catch (error) {
          console.error(`MCP工具执行失败: ${tool.name}`, error);
          
          return {
            toolCallId: toolCall.id,
            result: {
              success: false,
              error: error instanceof Error ? error.message : '执行失败',
              serverName,
              toolName: tool.name,
            },
            status: 'error' as const,
          };
        }
      };
    });

    return executors;
  }, [getAllTools, getConnection]);

  // 统计信息
  const stats = useMemo(() => {
    const mcpTools = getAllTools();
    return {
      totalTools: mcpTools.length,
      servers: [...new Set(mcpTools.map(t => t.serverName))],
      toolsByServer: mcpTools.reduce((acc, { serverName, tool }) => {
        if (!acc[serverName]) acc[serverName] = [];
        acc[serverName].push(tool.name);
        return acc;
      }, {} as Record<string, string[]>),
    };
  }, [getAllTools]);

  return {
    // 工具定义，可直接传递给@agent-labs/agent-chat
    toolDefinitions,
    // 工具执行器，可直接传递给@agent-labs/agent-chat
    toolExecutors,
    // 统计信息
    stats,
    // 原始MCP工具数据
    mcpTools: getAllTools(),
  };
} 