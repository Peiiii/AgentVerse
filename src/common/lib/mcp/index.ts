// 核心传输层抽象
export { type MCPTransport, MCPClient, type MCPMessage } from './transports/transport';

// 传输层实现
export { 
  MCPTransportFactory, 
  PostMessageTransport, 
  EventTransport,
  type TransportConfig 
} from './transports'; 