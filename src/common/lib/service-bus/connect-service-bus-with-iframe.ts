// service-bus/iframe-service-bus.ts
import type { Key } from './index';

/**
 * 主页面端：将 service-bus 能力暴露给 iframe
 * @param serviceBus 主 service-bus 实例
 * @param options 可选：origin 校验、事件前缀等
 */
export function connectServiceBusWithIframe(
  serviceBus: {
    invoke: (key: Key<unknown>, ...args: unknown[]) => unknown;
  },
  options?: {
    allowedOrigin?: string;
    eventPrefix?: string;
    windowObj?: Window; // 默认 window
  }
) {
  const {
    allowedOrigin,
    eventPrefix = 'service-bus',
    windowObj = window,
  } = options || {};

  function isValidOrigin(origin: string) {
    return !allowedOrigin || origin === allowedOrigin;
  }

  // 类型定义
  interface ServiceBusMessage {
    __sb: true;
    prefix: string;
    type: 'invoke' | 'result' | 'error';
    id: string;
    key?: string;
    args?: unknown[];
    result?: unknown;
    error?: string;
  }

  function isServiceBusEvent(data: unknown): data is ServiceBusMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      '__sb' in data &&
      'type' in data &&
      'id' in data
    );
  }

  function handleMessage(event: MessageEvent) {
    if (!isValidOrigin(event.origin)) return;
    const data = event.data;
    if (!isServiceBusEvent(data)) return;
    if (eventPrefix && data.prefix !== eventPrefix) return;
    if (data.type === 'invoke') {
      Promise.resolve()
        .then(() => serviceBus.invoke(data.key as Key<unknown>, ...(data.args || [])))
        .then((result) => {
          event.source?.postMessage(
            {
              __sb: true,
              prefix: eventPrefix,
              type: 'result',
              id: data.id,
              result,
            },
            { targetOrigin: event.origin }
          );
        })
        .catch((error) => {
          event.source?.postMessage(
            {
              __sb: true,
              prefix: eventPrefix,
              type: 'error',
              id: data.id,
              error: error instanceof Error ? error.message : String(error),
            },
            { targetOrigin: event.origin }
          );
        });
    }
  }

  windowObj.addEventListener('message', handleMessage);
  return () => windowObj.removeEventListener('message', handleMessage);
}

/**
 * iframe 端：创建 service-bus 代理，调用主页面能力
 * @param targetWindow 主页面 window
 * @param options 可选：eventPrefix、targetOrigin
 */
export function createIframeServiceBusProxy<T = unknown>(
  targetWindow: Window,
  options?: {
    eventPrefix?: string;
    targetOrigin?: string;
    timeoutMs?: number;
  }
): T {
  const {
    eventPrefix = 'service-bus',
    targetOrigin = '*',
    timeoutMs = 10000,
  } = options || {};
  let msgId = 0;
  const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void; timer: ReturnType<typeof setTimeout> }>();

  function genId() {
    return `sb_${Date.now()}_${msgId++}`;
  }

  // 类型定义
  interface ServiceBusMessage {
    __sb: true;
    prefix: string;
    type: 'invoke' | 'result' | 'error';
    id: string;
    key?: string;
    args?: unknown[];
    result?: unknown;
    error?: string;
  }

  function isServiceBusEvent(data: unknown): data is ServiceBusMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      '__sb' in data &&
      'type' in data &&
      'id' in data
    );
  }

  function handleMessage(event: MessageEvent) {
    const data = event.data;
    if (!isServiceBusEvent(data)) return;
    if (eventPrefix && data.prefix !== eventPrefix) return;
    const p = pending.get(data.id);
    if (!p) return;
    if (data.type === 'result') {
      p.resolve(data.result);
      clearTimeout(p.timer);
      pending.delete(data.id);
    } else if (data.type === 'error') {
      p.reject(new Error(data.error));
      clearTimeout(p.timer);
      pending.delete(data.id);
    }
  }

  window.addEventListener('message', handleMessage);

  function invoke(key: string, ...args: unknown[]): Promise<unknown> {
    const id = genId();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error('Service bus invoke timeout'));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      targetWindow.postMessage(
        {
          __sb: true,
          prefix: eventPrefix,
          type: 'invoke',
          id,
          key,
          args,
        },
        targetOrigin
      );
    });
  }

  // 代理所有方法为 invoke(key, ...args)
  return new Proxy(
    {},
    {
      get: (_: unknown, prop: string) => {
        return (...args: unknown[]) => invoke(prop, ...args);
      },
    }
  ) as T;
} 