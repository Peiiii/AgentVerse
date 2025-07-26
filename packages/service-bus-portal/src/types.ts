// service-bus-portal/src/types.ts

/**
 * Communication portal abstract interface
 */
export interface CommunicationPortal {
  readonly id: string;
  readonly type: PortalType;
  
  // Message transmission
  send(message: PortalMessage): Promise<void>;
  onMessage(handler: (message: PortalMessage) => void): void;
  
  // Lifecycle management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Status queries
  isConnected(): boolean;
  getTargetInfo(): PortalTargetInfo;
  
  // Utility methods
  generateMessageId(): string;
}

/**
 * Portal type enumeration
 */
export type PortalType = 
  | 'window-to-window'
  | 'window-to-worker'
  | 'window-to-iframe'
  | 'worker-to-window'
  | 'iframe-to-window'
  | 'shared-worker'
  | 'service-worker';

/**
 * Portal message format
 */
export interface PortalMessage {
  readonly id: string;
  readonly type: 'invoke' | 'result' | 'error';
  readonly timestamp: number;
  readonly source: string;
  readonly target: string;
  readonly data: {
    key?: string;
    args?: unknown[];
    result?: unknown;
    error?: string;
  };
  readonly metadata?: Record<string, unknown>;
}

/**
 * Portal target information
 */
export interface PortalTargetInfo {
  readonly type: PortalType;
  readonly origin?: string;
  readonly capabilities?: string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * Portal configuration
 */
export interface PortalConfig {
  readonly id: string;
  readonly type: PortalType;
  readonly timeoutMs?: number;
  readonly retryAttempts?: number;
  readonly security?: PortalSecurityConfig;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Security configuration
 */
export interface PortalSecurityConfig {
  readonly allowedOrigins?: string[];
  readonly allowedTargets?: string[];
  readonly requireAuthentication?: boolean;
  readonly encryptionRequired?: boolean;
} 