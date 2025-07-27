// Comprehensive Example for @cardos/service-bus-portal
// This example demonstrates how to use multiple portal types in a single application

import { 
  PortalFactory, 
  PortalServiceBusProxy, 
  PortalServiceBusConnector,
  PortalComposer 
} from '@cardos/service-bus-portal';

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

interface WorkerServices {
  'math.add': (a: number, b: number) => Promise<number>;
  'math.multiply': (a: number, b: number) => Promise<number>;
  'math.fibonacci': (n: number) => Promise<number>;
  'data.process': (data: string[]) => Promise<string[]>;
}

interface IframeServices {
  'ui.render': (component: string, props: any) => Promise<string>;
  'data.fetch': (url: string) => Promise<any>;
  'auth.validate': (token: string) => Promise<boolean>;
}

interface LocalServices {
  'local.notify': (message: string) => Promise<string>;
  'local.getData': () => Promise<any>;
  'local.updateUI': (updates: any) => Promise<string>;
}

// ============================================================================
// MAIN APPLICATION SETUP
// ============================================================================

export class PortalApplication {
  private composer: PortalComposer;
  private workerServices: WorkerServices | null = null;
  private iframeServices: IframeServices | null = null;
  private localServices: LocalServices | null = null;

  constructor() {
    this.composer = new PortalComposer();
  }

  async initialize() {
    console.log('Initializing Portal Application...');

    // Setup Worker Portal
    await this.setupWorkerPortal();

    // Setup Iframe Portal
    await this.setupIframePortal();

    // Setup Local EventTarget Portal
    await this.setupLocalPortal();

    // Setup Portal Composer
    await this.setupComposer();

    console.log('Portal Application initialized successfully');
  }

  // ============================================================================
  // WORKER PORTAL SETUP
  // ============================================================================

  private async setupWorkerPortal() {
    // Create a worker
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    });

    // Create portal for worker
    const workerPortal = PortalFactory.createWorkerPortal(worker);
    this.composer.addPortal(workerPortal);

    // Create proxy for worker services
    const workerProxy = new PortalServiceBusProxy(workerPortal);
    await workerProxy.connect();
    this.workerServices = workerProxy.createProxy() as WorkerServices;

    // Setup worker event handling
    worker.addEventListener('message', (event) => {
      if (event.data.type === 'progress') {
        console.log('Worker progress:', event.data.progress);
      }
    });

    console.log('Worker portal setup complete');
  }

  // ============================================================================
  // IFRAME PORTAL SETUP
  // ============================================================================

  private async setupIframePortal() {
    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.src = '/iframe-page.html';
    iframe.style.width = '100%';
    iframe.style.height = '300px';
    iframe.style.border = '1px solid #ccc';
    iframe.style.margin = '10px 0';
    
    document.body.appendChild(iframe);

    // Wait for iframe to load
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
    });

    // Create portal for iframe
    const iframePortal = PortalFactory.createIframePortal(iframe);
    this.composer.addPortal(iframePortal);

    // Create proxy for iframe services
    const iframeProxy = new PortalServiceBusProxy(iframePortal);
    await iframeProxy.connect();
    this.iframeServices = iframeProxy.createProxy() as IframeServices;

    console.log('Iframe portal setup complete');
  }

  // ============================================================================
  // LOCAL EVENTTARGET PORTAL SETUP
  // ============================================================================

  private async setupLocalPortal() {
    // Create local EventTarget portal
    const localPortal = PortalFactory.createEventTargetPortal(
      'local-portal',
      'window-to-window',
      document,
      'app-channel'
    );
    this.composer.addPortal(localPortal);

    // Define local services
    const localServices = {
      'local.notify': async (message: string) => {
        console.log('Local notification:', message);
        return 'Notification processed locally';
      },

      'local.getData': async () => {
        return {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      },

      'local.updateUI': async (updates: any) => {
        const statusElement = document.getElementById('status');
        if (statusElement) {
          statusElement.textContent = `Updated: ${JSON.stringify(updates)}`;
        }
        return 'UI updated locally';
      }
    };

    // Create service bus for local services
    const localServiceBus = {
      invoke: (key: string, ...args: unknown[]) => {
        const service = localServices[key as keyof typeof localServices];
        if (service) {
          return (service as any)(...args);
        }
        throw new Error(`Service not found: ${key}`);
      }
    };

    // Create connector for local services
    const localConnector = new PortalServiceBusConnector(localPortal, localServiceBus);
    
    // Connect local services
    localConnector.connect();

    // Create proxy for local services (for consistency)
    const localProxy = new PortalServiceBusProxy(localPortal);
    await localProxy.connect();
    this.localServices = localProxy.createProxy() as LocalServices;

    console.log('Local portal setup complete');
  }

  // ============================================================================
  // PORTAL COMPOSER SETUP
  // ============================================================================

  private async setupComposer() {
    // Create a mock service bus for demonstration
    const serviceBus = {
      invoke: (key: string, ...args: unknown[]) => {
        console.log(`Service bus invoked: ${key}`, args);
        return Promise.resolve('service-bus-result');
      }
    };

    // Create connectors for all portals
    for (const portal of this.composer.listPortals()) {
      this.composer.createConnector(portal.id, serviceBus);
    }

    // Connect all portals
    await this.composer.connectAll();

    console.log('Portal composer setup complete');
  }

  // ============================================================================
  // APPLICATION METHODS
  // ============================================================================

  async performComplexOperation() {
    console.log('Performing complex operation using all portals...');

    try {
      // Use worker for CPU-intensive tasks
      const fibResult = await this.workerServices!['math.fibonacci'](35);
      console.log('Fibonacci result:', fibResult);

      // Use iframe for UI rendering
      const uiResult = await this.iframeServices!['ui.render']('card', {
        title: 'Complex Operation',
        content: `Fibonacci(35) = ${fibResult}`
      });
      console.log('UI rendered:', uiResult);

      // Use local services for notifications
      const notifyResult = await this.localServices!['local.notify'](
        `Complex operation completed with result: ${fibResult}`
      );
      console.log('Notification result:', notifyResult);

      return { fibResult, uiResult, notifyResult };

    } catch (error) {
      console.error('Complex operation failed:', error);
      throw error;
    }
  }

  async performConcurrentOperations() {
    console.log('Performing concurrent operations...');

    const promises = [
      // Worker operations
      this.workerServices!['math.add'](10, 20),
      this.workerServices!['math.multiply'](5, 6),
      this.workerServices!['data.process'](['a', 'b', 'c']),

      // Iframe operations
      this.iframeServices!['data.fetch']('https://api.example.com/data'),
      this.iframeServices!['auth.validate']('user-token-123'),

      // Local operations
      this.localServices!['local.getData'](),
      this.localServices!['local.updateUI']({ status: 'processing' })
    ];

    const results = await Promise.all(promises);
    console.log('Concurrent operations completed:', results);

    return results;
  }

  async demonstrateBidirectionalCommunication() {
    console.log('Demonstrating bidirectional communication...');

    // Send messages to different portals
    const messages = [
      this.workerServices!['data.process'](['bidirectional', 'communication', 'test']),
      this.iframeServices!['ui.render']('button', { text: 'Bidirectional Test', onClick: 'test()' }),
      this.localServices!['local.notify']('Bidirectional communication test')
    ];

    const results = await Promise.all(messages);
    console.log('Bidirectional communication results:', results);

    return results;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async cleanup() {
    console.log('Cleaning up Portal Application...');
    
    // Disconnect all portals
    await this.composer.disconnectAll();
    
    console.log('Portal Application cleaned up');
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

export async function runComprehensiveExample() {
  console.log('Starting Comprehensive Portal Example...');

  const app = new PortalApplication();

  try {
    // Initialize the application
    await app.initialize();

    // Perform various operations
    await app.performComplexOperation();
    await app.performConcurrentOperations();
    await app.demonstrateBidirectionalCommunication();

    console.log('Comprehensive example completed successfully');

  } catch (error) {
    console.error('Comprehensive example failed:', error);
  } finally {
    // Cleanup
    await app.cleanup();
  }

  return app;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createStatusElement() {
  const statusElement = document.createElement('div');
  statusElement.id = 'status';
  statusElement.style.padding = '10px';
  statusElement.style.margin = '10px';
  statusElement.style.border = '1px solid #ccc';
  statusElement.style.backgroundColor = '#f9f9f9';
  statusElement.textContent = 'Portal Application Status: Ready';
  
  document.body.appendChild(statusElement);
  return statusElement;
}

export function createControlPanel() {
  const panel = document.createElement('div');
  panel.style.padding = '10px';
  panel.style.margin = '10px';
  panel.style.border = '1px solid #ccc';
  panel.style.backgroundColor = '#f0f0f0';

  const title = document.createElement('h3');
  title.textContent = 'Portal Control Panel';
  panel.appendChild(title);

  const buttons = [
    { text: 'Complex Operation', action: () => runComprehensiveExample() },
    { text: 'Worker Test', action: async () => {
      const app = new PortalApplication();
      await app.initialize();
      await app.performComplexOperation();
    }},
    { text: 'Iframe Test', action: async () => {
      const app = new PortalApplication();
      await app.initialize();
      await app.performConcurrentOperations();
    }}
  ];

  buttons.forEach(({ text, action }) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.margin = '5px';
    button.onclick = action;
    panel.appendChild(button);
  });

  document.body.appendChild(panel);
  return panel;
} 