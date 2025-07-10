/**
 * 通用MCP传输层抽象
 * 支持多种通信方式，保持与原始MCP协议的完全兼容
 */

// MCP消息格式（完全兼容原始MCP协议）
export interface MCPMessage {
  jsonrpc: "2.0";
  id: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

// 传输层抽象接口
export interface MCPTransport {
  // 核心：发送和接收MCP消息
  send(message: MCPMessage): Promise<void>;
  onMessage(handler: (message: MCPMessage) => void): void;
  
  // 连接管理（可选）
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}

// 通用MCP客户端
export class MCPClient {
  private transport: MCPTransport;
  private messageHandlers = new Map<string | number, (result: any) => void>();
  private messageIdCounter = 0;
  
  constructor(transport: MCPTransport) {
    this.transport = transport;
    this.transport.onMessage(this.handleMessage.bind(this));
  }
  
  // 工具发现
  async listTools(): Promise<any[]> {
    const result = await this.request("tools/list", {});
    return result.tools || [];
  }
  
  // 工具调用
  async callTool(name: string, args: any): Promise<any> {
    const result = await this.request("tools/call", { name, arguments: args });
    return result;
  }
  
  // 资源发现
  async listResources(): Promise<any[]> {
    const result = await this.request("resources/list", {});
    return result.resources || [];
  }
  
  // 提示发现
  async listPrompts(): Promise<any[]> {
    const result = await this.request("prompts/list", {});
    return result.prompts || [];
  }
  
  private async request(method: string, params: any): Promise<any> {
    const id = this.generateId();
    
    return new Promise((resolve) => {
      this.messageHandlers.set(id, resolve);
      
      this.transport.send({
        jsonrpc: "2.0",
        id,
        method,
        params
      });
    });
  }
  
  private handleMessage(message: MCPMessage) {
    if (message.id && this.messageHandlers.has(message.id)) {
      const handler = this.messageHandlers.get(message.id)!;
      this.messageHandlers.delete(message.id);
      
      if (message.error) {
        // 处理错误响应
        throw new Error(message.error.message || 'MCP request failed');
      } else {
        // 处理成功响应
        handler(message.result);
      }
    }
  }
  
  private generateId(): string {
    return `mcp-${++this.messageIdCounter}-${Date.now()}`;
  }
} 