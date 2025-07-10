// 核心传输层抽象
export { MCPTransport, MCPClient, MCPMessage } from './transport';

// 传输层实现
export { 
  MCPTransportFactory, 
  PostMessageTransport, 
  EventTransport,
  type TransportConfig 
} from './transports'; 