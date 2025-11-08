// service-bus-portal/src/service-bus.ts
import type { CommunicationPortal, PortalMessage } from './types';

// ==================== Service Bus Connector ====================

/**
 * Service bus connector based on portal
 */
export class PortalServiceBusConnector {
  private portal: CommunicationPortal;
  private serviceBus: {
    invoke: (key: string, ...args: unknown[]) => unknown;
  };

  constructor(
    portal: CommunicationPortal,
    serviceBus: {
      invoke: (key: string, ...args: unknown[]) => unknown;
    }
  ) {
    this.portal = portal;
    this.serviceBus = serviceBus;
    this.setupMessageHandling();
  }

  async connect(): Promise<void> {
    await this.portal.connect();
  }

  async disconnect(): Promise<void> {
    await this.portal.disconnect();
  }

  private setupMessageHandling(): void {
    this.portal.onMessage(async (message) => {
            if (message.type === 'invoke') {
        await this.handleInvoke(message);
      }
    });
  }

  private async handleInvoke(message: PortalMessage): Promise<void> {
    try {
      const { key, args = [] } = message.data;
      if (!key) {
        throw new Error('Missing service key');
      }

      
      const result = await Promise.resolve(
        this.serviceBus.invoke(key, ...args)
      );

      
      const responseMessage: PortalMessage = {
        id: this.portal.generateMessageId(),
        type: 'result',
        timestamp: Date.now(),
        source: this.portal.id,
        target: message.source,
        data: { result },
        metadata: { originalMessageId: message.id }
      };

            await this.portal.send(responseMessage);

    } catch (error) {
      console.error(`[PortalServiceBusConnector] Error handling invoke:`, error);
      
      const errorMessage: PortalMessage = {
        id: this.portal.generateMessageId(),
        type: 'error',
        timestamp: Date.now(),
        source: this.portal.id,
        target: message.source,
        data: { 
          error: error instanceof Error ? error.message : String(error) 
        },
        metadata: { originalMessageId: message.id }
      };

            await this.portal.send(errorMessage);
    }
  }
}

// ==================== Service Bus Proxy ====================

/**
 * Service bus proxy based on portal
 */
export class PortalServiceBusProxy<T = unknown> {
  private portal: CommunicationPortal;
  private pending = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  constructor(portal: CommunicationPortal) {
    this.portal = portal;
    this.setupMessageHandling();
  }

  async connect(): Promise<void> {
    await this.portal.connect();
  }

  async disconnect(): Promise<void> {
    // Clean up all pending requests
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Portal disconnected'));
    }
    this.pending.clear();

    await this.portal.disconnect();
  }

  private setupMessageHandling(): void {
    this.portal.onMessage((message) => {
            
      const pending = this.pending.get(message.metadata?.originalMessageId as string);
      if (!pending) {
        console.warn(`[PortalServiceBusProxy] No pending request found for messageId: ${message.metadata?.originalMessageId}`);
        return;
      }

            clearTimeout(pending.timer);
      this.pending.delete(message.metadata?.originalMessageId as string);

      if (message.type === 'result') {
                pending.resolve(message.data.result);
      } else if (message.type === 'error') {
        console.error(`[PortalServiceBusProxy] Rejecting with error:`, message.data.error);
        pending.reject(new Error(message.data.error));
      }
    });
  }

  private async invoke(key: string, ...args: unknown[]): Promise<unknown> {
    if (!this.portal.isConnected()) {
      throw new Error('Portal not connected');
    }

    const messageId = this.portal.generateMessageId();
    
            
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.error(`[PortalServiceBusProxy] Service invocation timeout for: ${key} (messageId: ${messageId})`);
        console.error(`[PortalServiceBusProxy] Pending requests:`, Array.from(this.pending.keys()));
        this.pending.delete(messageId);
        reject(new Error(`Service invocation timeout for: ${key}`));
      }, 10000);

      this.pending.set(messageId, { resolve, reject, timer });

      const message: PortalMessage = {
        id: messageId,
        type: 'invoke',
        timestamp: Date.now(),
        source: this.portal.id,
        target: '*',
        data: { key, args },
        metadata: { messageId }
      };

            
      this.portal.send(message).catch(error => {
        console.error(`[PortalServiceBusProxy] Failed to send message:`, error);
        this.pending.delete(messageId);
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  createProxy(): T {
    return new Proxy(
      {},
      {
        get: (_: unknown, prop: string) => {
          return (...args: unknown[]) => this.invoke(prop, ...args);
        },
      }
    ) as T;
  }
} 
