import { MCPTransport, MCPMessage } from './transport';

/**
 * Event传输层
 * 支持事件系统通信
 */
export class EventTransport implements MCPTransport {
  private eventBus: EventTarget;
  private channel: string;
  private messageHandler?: (message: MCPMessage) => void;
  private listener?: (event: CustomEvent) => void;
  
  constructor(eventBus: EventTarget, channel: string) {
    this.eventBus = eventBus;
    this.channel = channel;
  }
  
  async send(message: MCPMessage): Promise<void> {
    const event = new CustomEvent(`${this.channel}:mcp`, {
      detail: message
    });
    this.eventBus.dispatchEvent(event);
  }
  
  onMessage(handler: (message: MCPMessage) => void): void {
    this.messageHandler = handler;
    
    // 移除之前的监听器
    if (this.listener) {
      this.eventBus.removeEventListener(`${this.channel}:mcp`, this.listener as EventListener);
    }
    
    // 创建新的监听器
    this.listener = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        this.messageHandler!(customEvent.detail);
      }
    };
    
    // 添加监听器
    this.eventBus.addEventListener(`${this.channel}:mcp`, this.listener as EventListener);
  }
  
  async connect(): Promise<void> {
    // Event不需要显式连接
    return Promise.resolve();
  }
  
  async disconnect(): Promise<void> {
    // 移除监听器
    if (this.listener) {
      this.eventBus.removeEventListener(`${this.channel}:mcp`, this.listener as EventListener);
      this.listener = undefined;
    }
  }
} 