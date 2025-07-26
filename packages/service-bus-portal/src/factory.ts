// service-bus-portal/src/factory.ts
import type { PortalType, PortalConfig, CommunicationPortal } from './types';
import { PostMessagePortal, EventTargetPortal } from './core';
import { PortalServiceBusConnector, PortalServiceBusProxy } from './service-bus';

// ==================== Portal Factory ====================

/**
 * Portal factory for creating different types of portals
 */
export class PortalFactory {
  /**
   * Create a PostMessage-based portal
   */
  static createPostMessagePortal(
    id: string,
    type: PortalType,
    target: Window | Worker,
    config: Partial<PortalConfig> = {}
  ): PostMessagePortal {
    const fullConfig: PortalConfig = {
      id,
      type,
      timeoutMs: 10000,
      retryAttempts: 3,
      ...config
    };

    return new PostMessagePortal(id, type, target, fullConfig);
  }

  /**
   * Create an EventTarget-based portal
   */
  static createEventTargetPortal(
    id: string,
    type: PortalType,
    eventTarget: EventTarget,
    channel: string,
    config: Partial<PortalConfig> = {}
  ): EventTargetPortal {
    const fullConfig: PortalConfig = {
      id,
      type,
      timeoutMs: 10000,
      retryAttempts: 3,
      ...config
    };

    return new EventTargetPortal(id, type, eventTarget, channel, fullConfig);
  }

  /**
   * Create a portal for Web Worker communication
   */
  static createWorkerPortal(
    worker: Worker,
    config: Partial<PortalConfig> = {}
  ): PostMessagePortal {
    return this.createPostMessagePortal(
      `worker-${Date.now()}`,
      'window-to-worker',
      worker,
      config
    );
  }

  /**
   * Create a portal for iframe communication
   */
  static createIframePortal(
    iframe: HTMLIFrameElement,
    config: Partial<PortalConfig> = {}
  ): PostMessagePortal {
    return this.createPostMessagePortal(
      `iframe-${Date.now()}`,
      'window-to-iframe',
      iframe.contentWindow!,
      config
    );
  }
}

// ==================== Portal Composer ====================

/**
 * Portal composer for managing multiple portals
 */
export class PortalComposer {
  private portals = new Map<string, CommunicationPortal>();
  private connectors = new Map<string, PortalServiceBusConnector>();
  private proxies = new Map<string, PortalServiceBusProxy>();

  /**
   * Add a portal to the composer
   */
  addPortal(portal: CommunicationPortal): void {
    this.portals.set(portal.id, portal);
  }

  /**
   * Remove a portal from the composer
   */
  removePortal(portalId: string): void {
    const portal = this.portals.get(portalId);
    if (portal) {
      portal.disconnect();
      this.portals.delete(portalId);
      this.connectors.delete(portalId);
      this.proxies.delete(portalId);
    }
  }

  /**
   * Create a service bus connector for a portal
   */
  createConnector(
    portalId: string,
    serviceBus: { invoke: (key: string, ...args: unknown[]) => unknown }
  ): PortalServiceBusConnector {
    const portal = this.portals.get(portalId);
    if (!portal) {
      throw new Error(`Portal not found: ${portalId}`);
    }

    const connector = new PortalServiceBusConnector(portal, serviceBus);
    this.connectors.set(portalId, connector);
    return connector;
  }

  /**
   * Create a service bus proxy for a portal
   */
  createProxy<T = unknown>(portalId: string): PortalServiceBusProxy<T> {
    const portal = this.portals.get(portalId);
    if (!portal) {
      throw new Error(`Portal not found: ${portalId}`);
    }

    const proxy = new PortalServiceBusProxy<T>(portal);
    this.proxies.set(portalId, proxy);
    return proxy;
  }

  /**
   * Connect all portals
   */
  async connectAll(): Promise<void> {
    const promises = Array.from(this.portals.values()).map(portal => portal.connect());
    await Promise.all(promises);
  }

  /**
   * Disconnect all portals
   */
  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.portals.values()).map(portal => portal.disconnect());
    await Promise.all(promises);
  }

  /**
   * Get a portal by ID
   */
  getPortal(portalId: string): CommunicationPortal | undefined {
    return this.portals.get(portalId);
  }

  /**
   * List all portals
   */
  listPortals(): CommunicationPortal[] {
    return Array.from(this.portals.values());
  }
} 