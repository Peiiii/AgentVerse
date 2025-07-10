import { MCPTransport, MCPMessage } from '../transport';

/**
 * PostMessage传输层
 * 支持iframe、worker等PostMessage通信
 */
export class PostMessageTransport implements MCPTransport {
  private target: Window | Worker;
  private messageHandler?: (message: MCPMessage) => void;
  private listener?: (event: MessageEvent) => void;
  
  constructor(target: Window | Worker) {
    this.target = target;
  }
  
  async send(message: MCPMessage): Promise<void> {
    this.target.postMessage({
      type: 'mcp',
      data: message
    });
  }
  
  onMessage(handler: (message: MCPMessage) => void): void {
    this.messageHandler = handler;
    
    // 移除之前的监听器
    if (this.listener) {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', this.listener);
      } else if (typeof self !== 'undefined') {
        self.removeEventListener('message', this.listener);
      }
    }
    
    // 创建新的监听器
    this.listener = (event: MessageEvent) => {
      if (event.data?.type === 'mcp' && event.data?.data) {
        this.messageHandler!(event.data.data);
      }
    };
    
    // 添加监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.listener);
    } else if (typeof self !== 'undefined') {
      self.addEventListener('message', this.listener);
    }
  }
  
  async connect(): Promise<void> {
    // PostMessage不需要显式连接
    return Promise.resolve();
  }
  
  async disconnect(): Promise<void> {
    // 移除监听器
    if (this.listener) {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', this.listener);
      } else if (typeof self !== 'undefined') {
        self.removeEventListener('message', this.listener);
      }
      this.listener = undefined;
    }
  }
} 