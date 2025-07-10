import { MCPTransport } from '../transport';
import { PostMessageTransport } from './postmessage';
import { EventTransport } from './event';

// 传输层配置类型
export interface TransportConfig {
  type: 'postmessage' | 'event';
  target?: Window | Worker;
  eventBus?: EventTarget;
  channel?: string;
}

// 传输层工厂
export class MCPTransportFactory {
  static create(config: TransportConfig): MCPTransport {
    switch (config.type) {
      case 'postmessage':
        if (!config.target) {
          throw new Error('PostMessage transport requires target Window or Worker');
        }
        return new PostMessageTransport(config.target);
        
      case 'event':
        if (!config.eventBus || !config.channel) {
          throw new Error('Event transport requires eventBus and channel');
        }
        return new EventTransport(config.eventBus, config.channel);
        
      default:
        throw new Error(`Unsupported transport type: ${config.type}`);
    }
  }
}

// 导出所有传输层
export { PostMessageTransport } from './postmessage';
export { EventTransport } from './event'; 