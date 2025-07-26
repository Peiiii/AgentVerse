// service-bus-portal/examples/basic-usage.ts
import { PortalFactory, PortalServiceBusProxy, PortalComposer } from '../src';

// Example 1: Basic Web Worker Communication
export async function basicWorkerExample() {
  // Create a worker
  const worker = new Worker('/worker.js');
  
  // Create a portal for the worker
  const portal = PortalFactory.createWorkerPortal(worker);
  
  // Create a proxy for remote service calls
  const proxy = new PortalServiceBusProxy(portal);
  await proxy.connect();
  
  // Create a typed proxy
  const serviceProxy = proxy.createProxy() as {
    'math.add': (a: number, b: number) => Promise<number>;
    'math.multiply': (a: number, b: number) => Promise<number>;
  };
  
  // Use the proxy
  const result = await serviceProxy['math.add'](5, 3);
  console.log('Result:', result); // 8
}

// Example 2: Multi-Portal Composition
export async function multiPortalExample() {
  const composer = new PortalComposer();
  
  // Create multiple portals
  const worker = new Worker('/worker.js');
  const workerPortal = PortalFactory.createWorkerPortal(worker);
  
  const iframe = document.createElement('iframe');
  iframe.src = '/iframe.html';
  const iframePortal = PortalFactory.createIframePortal(iframe);
  
  // Add portals to composer
  composer.addPortal(workerPortal);
  composer.addPortal(iframePortal);
  
  // Create service bus (mock)
  const serviceBus = {
    invoke: (key: string, ...args: unknown[]) => {
      console.log(`Service invoked: ${key}`, args);
      return Promise.resolve('result');
    }
  };
  
  // Create connectors for each portal
  composer.createConnector(workerPortal.id, serviceBus);
  composer.createConnector(iframePortal.id, serviceBus);
  
  // Connect all portals
  await composer.connectAll();
  
  console.log('All portals connected');
}

// Example 3: EventTarget Portal
export async function eventTargetExample() {
  // Create an EventTarget portal for same-context communication
  const portal = PortalFactory.createEventTargetPortal(
    'event-portal',
    'window-to-window',
    document,
    'app-channel'
  );
  
  const proxy = new PortalServiceBusProxy(portal);
  await proxy.connect();
  
  const serviceProxy = proxy.createProxy() as {
    'localService.doSomething': (data: string) => Promise<string>;
  };
  
  const result = await serviceProxy['localService.doSomething']('test');
  console.log('EventTarget result:', result);
} 