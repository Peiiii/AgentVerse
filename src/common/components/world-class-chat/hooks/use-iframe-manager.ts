import { useState, useCallback, useRef } from 'react';

export interface IframeInfo {
  id: string;
  key: string;
  type: 'html-preview' | 'preview' | 'custom';
  createdAt: number;
  element?: HTMLIFrameElement;
}

export class IframeManager {
  private iframes = new Map<string, IframeInfo>();
  private listeners = new Map<string, Set<(iframe: IframeInfo) => void>>();

  // 创建新的 iframe
  createIframe(key: string, type: IframeInfo['type'] = 'custom'): string {
    const id = `iframe-${key}-${Date.now()}`;
    const iframeInfo: IframeInfo = {
      id,
      key,
      type,
      createdAt: Date.now(),
    };
    
    this.iframes.set(id, iframeInfo);
    this.notifyListeners('created', iframeInfo);
    
    return id;
  }

  // 注册 iframe 元素
  registerElement(id: string, element: HTMLIFrameElement): void {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo) {
      iframeInfo.element = element;
      this.notifyListeners('registered', iframeInfo);
    }
  }

  // 获取 iframe 信息
  getIframe(id: string): IframeInfo | undefined {
    return this.iframes.get(id);
  }

  // 获取 iframe 元素
  getElement(id: string): HTMLIFrameElement | undefined {
    const iframeInfo = this.iframes.get(id);
    return iframeInfo?.element;
  }

  // 获取所有 iframe
  getAllIframes(): IframeInfo[] {
    return Array.from(this.iframes.values());
  }

  // 根据 key 获取 iframe
  getIframeByKey(key: string): IframeInfo | undefined {
    return Array.from(this.iframes.values()).find(iframe => iframe.key === key);
  }

  // 移除 iframe
  removeIframe(id: string): void {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo) {
      this.iframes.delete(id);
      this.notifyListeners('removed', iframeInfo);
    }
  }

  // 清理过期的 iframe（超过指定时间的）
  cleanupExpired(maxAge: number = 30 * 60 * 1000): void { // 默认30分钟
    const now = Date.now();
    const expiredIds: string[] = [];
    
    this.iframes.forEach((iframe, id) => {
      if (now - iframe.createdAt > maxAge) {
        expiredIds.push(id);
      }
    });
    
    expiredIds.forEach(id => this.removeIframe(id));
  }

  // 向 iframe 发送消息
  postMessage(id: string, message: any, targetOrigin: string = '*'): boolean {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo?.element?.contentWindow) {
      iframeInfo.element.contentWindow.postMessage(message, targetOrigin);
      return true;
    }
    return false;
  }

  // 注入 CSS 到 iframe
  injectCSS(id: string, css: string): boolean {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo?.element?.contentDocument) {
      const style = iframeInfo.element.contentDocument.createElement('style');
      style.textContent = css;
      iframeInfo.element.contentDocument.head.appendChild(style);
      return true;
    }
    return false;
  }

  // 注入 JavaScript 到 iframe
  injectScript(id: string, script: string): boolean {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo?.element?.contentDocument) {
      const scriptElement = iframeInfo.element.contentDocument.createElement('script');
      scriptElement.textContent = script;
      iframeInfo.element.contentDocument.head.appendChild(scriptElement);
      return true;
    }
    return false;
  }

  // 获取 iframe 内容
  getContent(id: string): string | null {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo?.element?.contentDocument) {
      return iframeInfo.element.contentDocument.documentElement.outerHTML;
    }
    return null;
  }

  // 设置 iframe 内容
  setContent(id: string, html: string): boolean {
    const iframeInfo = this.iframes.get(id);
    if (iframeInfo?.element?.contentDocument) {
      iframeInfo.element.contentDocument.open();
      iframeInfo.element.contentDocument.write(html);
      iframeInfo.element.contentDocument.close();
      return true;
    }
    return false;
  }

  // 监听器管理
  addListener(event: string, callback: (iframe: IframeInfo) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  removeListener(event: string, callback: (iframe: IframeInfo) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private notifyListeners(event: string, iframe: IframeInfo): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(iframe));
    }
  }

  // 销毁管理器
  destroy(): void {
    this.iframes.clear();
    this.listeners.clear();
  }
}

// React Hook 包装器
export function useIframeManager() {
  const managerRef = useRef<IframeManager>();
  const [iframes, setIframes] = useState<IframeInfo[]>([]);

  // 确保只创建一个管理器实例
  if (!managerRef.current) {
    managerRef.current = new IframeManager();
  }

  const manager = managerRef.current;

  // 创建 iframe
  const createIframe = useCallback((key: string, type: IframeInfo['type'] = 'custom') => {
    const id = manager.createIframe(key, type);
    // 直接更新状态，避免依赖 updateIframes
    setIframes(manager.getAllIframes());
    return id;
  }, [manager]);

  // 注册 iframe 元素
  const registerElement = useCallback((id: string, element: HTMLIFrameElement) => {
    manager.registerElement(id, element);
    // 直接更新状态，避免依赖 updateIframes
    setIframes(manager.getAllIframes());
  }, [manager]);

  // 移除 iframe
  const removeIframe = useCallback((id: string) => {
    manager.removeIframe(id);
    // 直接更新状态，避免依赖 updateIframes
    setIframes(manager.getAllIframes());
  }, [manager]);

  // 清理过期 iframe
  const cleanupExpired = useCallback((maxAge?: number) => {
    manager.cleanupExpired(maxAge);
    // 直接更新状态，避免依赖 updateIframes
    setIframes(manager.getAllIframes());
  }, [manager]);

  // 组件卸载时清理
  const destroy = useCallback(() => {
    manager.destroy();
    setIframes([]);
  }, [manager]);

  return {
    // 状态
    iframes,
    
    // 方法
    createIframe,
    registerElement,
    removeIframe,
    cleanupExpired,
    destroy,
    
    // 直接访问管理器
    manager,
    
    // 便捷方法
    getIframe: manager.getIframe.bind(manager),
    getElement: manager.getElement.bind(manager),
    getIframeByKey: manager.getIframeByKey.bind(manager),
    postMessage: manager.postMessage.bind(manager),
    injectCSS: manager.injectCSS.bind(manager),
    injectScript: manager.injectScript.bind(manager),
    getContent: manager.getContent.bind(manager),
    setContent: manager.setContent.bind(manager),
  };
} 