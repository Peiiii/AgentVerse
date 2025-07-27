// Web Worker Example for @cardos/service-bus-portal
// This example demonstrates how to use the portal system with Web Workers

// ============================================================================
// MAIN THREAD (main.ts)
// ============================================================================

import { PortalFactory, PortalServiceBusProxy } from '@cardos/service-bus-portal';

// Define the service interface that the worker will provide
interface WorkerServices {
  'math.add': (a: number, b: number) => Promise<number>;
  'math.multiply': (a: number, b: number) => Promise<number>;
  'math.fibonacci': (n: number) => Promise<number>;
  'data.process': (data: string[]) => Promise<string[]>;
  'image.resize': (imageData: ImageData, width: number, height: number) => Promise<ImageData>;
}

// Create and connect to a worker
export async function setupWorkerCommunication() {
  // Create a worker
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module'
  });

  // Create a portal for the worker
  const portal = PortalFactory.createWorkerPortal(worker);

  // Create a proxy for remote service calls
  const proxy = new PortalServiceBusProxy(portal);
  await proxy.connect();

  // Create a typed proxy with our service interface
  const workerServices = proxy.createProxy() as WorkerServices;

  // Use the worker services
  try {
    // Basic math operations
    const sum = await workerServices['math.add'](10, 20);
    console.log('Sum:', sum); // 30

    const product = await workerServices['math.multiply'](5, 6);
    console.log('Product:', product); // 30

    // CPU-intensive operation
    const fib = await workerServices['math.fibonacci'](40);
    console.log('Fibonacci(40):', fib);

    // Data processing
    const processed = await workerServices['data.process'](['a', 'b', 'c']);
    console.log('Processed data:', processed);

    // Image processing (if available)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 100, 100);
    
    const resized = await workerServices['image.resize'](imageData, 50, 50);
    console.log('Image resized:', resized);

  } catch (error) {
    console.error('Worker communication error:', error);
  }

  return workerServices;
}

// Example of handling worker events
export function setupWorkerEventHandling(worker: Worker) {
  worker.addEventListener('message', (event) => {
    if (event.data.type === 'progress') {
      console.log('Worker progress:', event.data.progress);
    }
  });

  worker.addEventListener('error', (error) => {
    console.error('Worker error:', error);
  });
}

// ============================================================================
// WORKER THREAD (worker.ts)
// ============================================================================

// This would be in a separate worker.ts file
export const workerCode = `
import { PortalFactory, PortalServiceBusConnector } from '@cardos/service-bus-portal';

// Create a portal for the main thread
const portal = PortalFactory.createWorkerPortal(self);

// Create a connector to handle service requests
const connector = new PortalServiceBusConnector(portal);

// Define the services that this worker provides
const services = {
  'math.add': async (a: number, b: number) => {
    return a + b;
  },

  'math.multiply': async (a: number, b: number) => {
    return a * b;
  },

  'math.fibonacci': async (n: number) => {
    // CPU-intensive calculation
    if (n <= 1) return n;
    
    // Report progress
    self.postMessage({ type: 'progress', progress: 'Calculating fibonacci...' });
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  },

  'data.process': async (data: string[]) => {
    // Process data in worker thread
    return data.map(item => item.toUpperCase()).filter(item => item.length > 0);
  },

  'image.resize': async (imageData: ImageData, width: number, height: number) => {
    // Simple image resizing (in practice, you'd use more sophisticated algorithms)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    
    // Create a temporary canvas to resize
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw resized image
    ctx.drawImage(tempCanvas, 0, 0, width, height);
    
    return ctx.getImageData(0, 0, width, height);
  }
};

// Connect the services
connector.connect(services);

// Handle worker lifecycle
self.addEventListener('beforeunload', () => {
  connector.disconnect();
});
`;

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

export async function runWorkerExample() {
  console.log('Starting Web Worker example...');

  // Setup worker communication
  const workerServices = await setupWorkerCommunication();

  // Setup event handling
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module'
  });
  setupWorkerEventHandling(worker);

  // Demonstrate concurrent operations
  const promises = [
    workerServices['math.add'](1, 2),
    workerServices['math.multiply'](3, 4),
    workerServices['math.fibonacci'](35),
    workerServices['data.process'](['hello', 'world', 'from', 'worker'])
  ];

  const results = await Promise.all(promises);
  console.log('All operations completed:', results);

  return workerServices;
} 