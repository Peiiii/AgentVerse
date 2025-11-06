import { useState, useEffect } from 'react';
import { PortalFactory, PortalServiceBusConnector } from '@cardos/service-bus-portal';

export function usePortalDemo() {
  const [status, setStatus] = useState<string>('Ready');
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 重定向 console.log 到我们的日志系统
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  // 定义主线程提供的服务
  const mainThreadServices = {
    'math.add': async (a: number, b: number) => {
      return a + b;
    },
    
    'math.multiply': async (a: number, b: number) => {
      return a * b;
    },
    
    'math.fibonacci': async (n: number) => {
      if (n <= 1) return n;
      
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    },
    
    'data.process': async (data: string[]) => {
      return data.map(item => item.toUpperCase()).filter(item => item.length > 0);
    },

    'ui.render': async (component: string, props: Record<string, unknown>) => {
      switch (component) {
        case 'button':
          return `<button onclick="alert('${props.text} clicked!')" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">${props.text}</button>`;
        case 'input':
          return `<input type="${props.type || 'text'}" placeholder="${props.placeholder || ''}" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />`;
        case 'card':
          return `<div class="card" style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0;">${props.content}</div>`;
        default:
          return `<div>Unknown component: ${component}</div>`;
      }
    },
    
    'data.fetch': async (url: string) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 1,
            name: 'Sample Data from Main Thread',
            url: url,
            timestamp: new Date().toISOString(),
            source: 'main-thread'
          });
        }, 100);
      });
    },
    
    'auth.validate': async (token: string) => {
      // Simple token validation
      return token && token.length > 10 && token.includes('user');
    },
    
    'storage.get': async (key: string) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    
    'storage.set': async (key: string, value: unknown) => {
      localStorage.setItem(key, JSON.stringify(value));
      return 'stored';
    }
  };

  // 创建 service bus
  const serviceBus = {
    invoke: async (key: string, ...args: unknown[]) => {
      console.log('[Main thread][serviceBus.invoke]: invoke', key, args);
      const service = mainThreadServices[key as keyof typeof mainThreadServices];
      if (!service) {
        throw new Error(`Service not found: ${key}`);
      }
      if (typeof service !== 'function') {
        throw new Error(`Service is not callable: ${key}`);
      }
      const result = await (service as (...x: unknown[]) => unknown)(...args);
      console.log('[Main thread][serviceBus.invoke]: result', result);
      return result;
    }
  };

  const runExample = async (exampleName: string, exampleFn: () => Promise<unknown>) => {
    setIsRunning(true);
    setStatus(`Running ${exampleName}...`);
    setLogs([]);

    try {
      await exampleFn();
      setStatus(`${exampleName} completed successfully!`);
    } catch (error) {
      setStatus(`${exampleName} failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runWorkerExample = async () => {
    await runExample('Worker Example', async () => {
      // 生成一个唯一的 portal ID，worker 会使用相同的 ID
      const portalId = `worker-${Date.now()}`;
      
      const worker = new Worker(`/worker-portal.js?portalId=${portalId}`, { type: 'module' });
      
      // 监听worker消息，用于日志记录
      worker.onmessage = (event) => {
        const { type, data } = event.data;        
        // 将worker消息添加到日志中
        setLogs(prev => [...prev, `[Worker] ${type}: ${JSON.stringify(data, null, 2)}`]);
      };
      
      // 监听worker错误
      worker.onerror = (error) => {
        console.error('[Worker Error]:', error);
        setLogs(prev => [...prev, `[Worker Error] ${error.message}`]);
      };
      
      // 创建 worker portal - 使用新的便捷 API，传递 portal ID
      const portal = PortalFactory.createWorkerPortal(worker, {}, portalId);
      // 创建 connector 来提供能力给 worker
      const connector = new PortalServiceBusConnector(portal, serviceBus);
      await connector.connect();
      // 等待一段时间让 worker 完成服务调用
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });

      
      return ['Worker connected successfully'];
    });
  };

  const runIframeExample = async () => {
    await runExample('Iframe Example', async () => {
      const iframe = document.createElement('iframe');
      iframe.src = '/iframe-portal.html';
      iframe.style.width = '100%';
      iframe.style.height = '300px';
      iframe.style.border = '1px solid #ccc';
      iframe.style.margin = '10px 0';
      
      // 临时添加到页面
      const container = document.createElement('div');
      container.appendChild(iframe);
      document.body.appendChild(container);
      
      // 等待 iframe 加载
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });
      
      // 创建 iframe portal
      const portal = PortalFactory.createIframePortal(iframe);
      
      // 创建 connector 来提供能力给 iframe
      const connector = new PortalServiceBusConnector(portal, serviceBus);
      await connector.connect();
      // 模拟 iframe 调用主线程服务
      setTimeout(() => {
        // 在实际应用中，iframe 会主动调用主线程的服务
      }, 1000);
      
      return ['Iframe connected successfully'];
    });
  };

  const runComprehensiveExample = async () => {
    await runExample('Comprehensive Example', async () => {
      // 运行 worker 和 iframe 示例
      const [workerResults, iframeResults] = await Promise.all([
        runWorkerExample(),
        runIframeExample()
      ]);
      return { workerResults, iframeResults };
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    status,
    logs,
    isRunning,
    runWorkerExample,
    runIframeExample,
    runComprehensiveExample,
    clearLogs
  };
} 
