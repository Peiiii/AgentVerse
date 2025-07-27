// Worker using real @cardos/service-bus-portal
// Import from CDN using esm.sh
import { PortalFactory, PortalServiceBusProxy } from 'https://esm.sh/@cardos/service-bus-portal@latest';
const logToMainThread = (message) => {
  self.postMessage({ type: 'log', data: message });
}
logToMainThread('Worker: Starting portal initialization...');
// Worker is a CONSUMER of services from main thread
// Create a portal to communicate with main thread
// In worker, we need to listen for messages from main thread

// Get portal ID from URL parameters
const urlParams = new URLSearchParams(self.location.search);
const portalId = urlParams.get('portalId') || `worker-${Date.now()}`;
const portal = PortalFactory.createWindowPortal({}, portalId);

// Create a proxy to consume services from main thread
const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

// Create a typed proxy for main thread services
const mainThreadServices = proxy.createProxy();
// Send ready message to main thread
self.postMessage({ type: 'ready', data: 'Worker portal ready' });



logToMainThread('Worker: Starting portal initialization...');
// Actually call main thread services to demonstrate portal functionality
async function demonstrateWorkerServices() {
  try {
    // Call math services
    
    const addResult = await mainThreadServices['math.add'](15, 27);
    
    const multiplyResult = await mainThreadServices['math.multiply'](8, 9);
    
    const fibonacciResult = await mainThreadServices['math.fibonacci'](10);
    
    // Call data processing service
    const dataToProcess = ['hello', 'world', 'portal', 'demo'];
    const processedData = await mainThreadServices['data.process'](dataToProcess);
    
    
    // Send completion message to main thread
    self.postMessage({ 
      type: 'services-completed', 
      data: {
        addResult,
        multiplyResult,
        fibonacciResult,
        processedData
      }
    });
    
  } catch (error) {
    console.error('Worker: Error calling main thread services:', error);
    self.postMessage({ 
      type: 'error', 
      data: error.message 
    });
  }
}

// Start demonstrating services after a short delay
setTimeout(demonstrateWorkerServices, 500); 