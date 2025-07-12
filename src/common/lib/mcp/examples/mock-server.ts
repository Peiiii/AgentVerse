import { MCPTransport, MCPMessage } from '../transports/transport';

/**
 * 模拟MCP服务器
 * 用于演示不同传输层的功能
 */
export class MockMCPServer {
  private transport: MCPTransport;
  private tools = [
    {
      name: "file_read",
      description: "读取文件内容",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "文件路径"
          }
        },
        required: ["path"]
      }
    },
    {
      name: "file_write",
      description: "写入文件内容",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "文件路径"
          },
          content: {
            type: "string",
            description: "文件内容"
          }
        },
        required: ["path", "content"]
      }
    },
    {
      name: "search_web",
      description: "搜索网络信息",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "搜索查询"
          }
        },
        required: ["query"]
      }
    }
  ];

  constructor(transport: MCPTransport) {
    this.transport = transport;
    this.transport.onMessage(this.handleMessage.bind(this));
  }

  private async handleMessage(message: MCPMessage) {
    try {
      let result: unknown;

      switch (message.method) {
        case "tools/list":
          result = { tools: this.tools };
          break;

        case "tools/call":
          result = await this.handleToolCall(message.params as { name: string; arguments: Record<string, unknown> });
          break;

        case "resources/list":
          result = { resources: [] };
          break;

        case "prompts/list":
          result = { prompts: [] };
          break;

        default:
          throw new Error(`Unknown method: ${message.method}`);
      }

      // 发送成功响应
      await this.transport.send({
        jsonrpc: "2.0",
        id: message.id,
        result
      });

    } catch (error) {
      // 发送错误响应
      await this.transport.send({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
          data: null
        }
      });
    }
  }

  private async handleToolCall(params: { name: string; arguments: Record<string, unknown> }): Promise<unknown> {
    const { name, arguments: args } = params;

    switch (name) {
      case "file_read":
        return {
          content: `这是文件 ${args.path} 的内容：\n\nHello World!\n\n这是一个模拟的文件读取操作。`,
          size: 1024,
          modified: new Date().toISOString()
        };

      case "file_write":
        return {
          success: true,
          path: args.path as string,
          size: (args.content as string)?.length || 0,
          message: `文件 ${args.path as string} 写入成功`
        };

      case "search_web":
        return {
          results: [
            {
              title: `搜索结果：${args.query}`,
              url: "https://example.com/result1",
              snippet: `这是关于 "${args.query}" 的搜索结果...`
            },
            {
              title: `更多关于 ${args.query} 的信息`,
              url: "https://example.com/result2", 
              snippet: `这里提供了更多关于 "${args.query}" 的详细信息...`
            }
          ],
          total: 2
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
} 