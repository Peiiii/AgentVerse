// service-bus-portal/src/core.ts
import type {
  CommunicationPortal,
  PortalMessage,
  PortalType,
  PortalConfig,
  PortalTargetInfo
} from './types';

// ==================== Base Portal Implementation ====================

/**
 * Base portal implementation
 */
export abstract class BasePortal implements CommunicationPortal {
  protected messageHandlers: Array<(message: PortalMessage) => void> = [];
  protected connected = false;
  protected messageIdCounter = 0;

  constructor(
    public readonly id: string,
    public readonly type: PortalType,
    protected config: PortalConfig
  ) { }

  abstract send(message: PortalMessage): Promise<void>;
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract getTargetInfo(): PortalTargetInfo;

  onMessage(handler: (message: PortalMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  isConnected(): boolean {
    return this.connected;
  }

  generateMessageId(): string {
    return `${this.id}_${Date.now()}_${++this.messageIdCounter}`;
  }

  protected notifyHandlers(message: PortalMessage): void {

    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Portal message handler error:', error);
      }
    });
  }

  protected validateMessage(message: PortalMessage): boolean {
    return Boolean(message.id && message.type && message.timestamp > 0);
  }
}

// ==================== PostMessage Portal Implementation ====================

/**
 * PostMessage portal implementation
 */
export class PostMessagePortal extends BasePortal {
  private target: Window | Worker;
  private messageListener: ((event: MessageEvent) => void) | undefined;

  constructor(
    id: string,
    direction: PortalType,
    target: Window | Worker,
    config: PortalConfig
  ) {
    super(id, direction, config);
    this.target = target;
  }

  async send(message: PortalMessage): Promise<void> {
    if (!this.connected) {
      throw new Error('Portal not connected');
    }

    const wrappedMessage = {
      __portal: true,
      portalId: this.id,
      data: message
    };



    if (typeof Window !== 'undefined' && this.target instanceof Window) {
      this.target.postMessage(wrappedMessage, this.getTargetOrigin());
    } else if (typeof self !== 'undefined' && this.target === self) {
      // In worker context, send to parent (main thread)
      self.postMessage(wrappedMessage);
    } else {
      this.target.postMessage(wrappedMessage);
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;


    this.messageListener = (event: MessageEvent) => {
      const data = event.data;
      if (data?.__portal && data.portalId === this.id) {
                const message = data.data as PortalMessage;
        if (this.validateMessage(message)) {
          this.notifyHandlers(message);
        }
      }
    };

    const eventTarget = this.getEventTarget();
        eventTarget.addEventListener('message', this.messageListener as EventListener);
    this.connected = true;
      }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    if (this.messageListener) {
      this.getEventTarget().removeEventListener('message', this.messageListener as EventListener);
      this.messageListener = undefined;
    }

    this.connected = false;
  }

  getTargetInfo(): PortalTargetInfo {
    return {
      type: this.type,
      origin: this.getTargetOrigin(),
      capabilities: ['postmessage'],
      metadata: { target: this.target }
    };
  }

  private getEventTarget(): EventTarget {
    return this.target as EventTarget;
  }

  private getTargetOrigin(): string {
    if (typeof Window !== 'undefined' && this.target instanceof Window) {
      return this.target.location.origin;
    }
    return '*';
  }
}

// ==================== EventTarget Portal Implementation ====================

/**
 * EventTarget portal implementation
 */
export class EventTargetPortal extends BasePortal {
  private eventTarget: EventTarget;
  private channel: string;
  private listener: ((event: CustomEvent) => void) | undefined;

  constructor(
    id: string,
    direction: PortalType,
    eventTarget: EventTarget,
    channel: string,
    config: PortalConfig
  ) {
    super(id, direction, config);
    this.eventTarget = eventTarget;
    this.channel = channel;
  }

  async send(message: PortalMessage): Promise<void> {
    if (!this.connected) {
      throw new Error('Portal not connected');
    }

    const event = new CustomEvent(`${this.channel}:portal`, {
      detail: {
        portalId: this.id,
        data: message
      }
    });

    this.eventTarget.dispatchEvent(event);
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    this.listener = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail?.portalId === this.id) {
        const message = detail.data as PortalMessage;
        if (this.validateMessage(message)) {
          this.notifyHandlers(message);
        }
      }
    };

    this.eventTarget.addEventListener(`${this.channel}:portal`, this.listener as EventListener);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    if (this.listener) {
      this.eventTarget.removeEventListener(`${this.channel}:portal`, this.listener as EventListener);
      this.listener = undefined;
    }

    this.connected = false;
  }

  getTargetInfo(): PortalTargetInfo {
    return {
      type: this.type,
      capabilities: ['event-target'],
      metadata: { channel: this.channel, eventTarget: this.eventTarget }
    };
  }
} 