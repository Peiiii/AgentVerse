// Iframe Example for @cardos/service-bus-portal
// This example demonstrates how to use the portal system with iframes

// ============================================================================
// MAIN PAGE (parent.html)
// ============================================================================

import { PortalFactory, PortalServiceBusProxy } from '@cardos/service-bus-portal';

// Define the service interface that the iframe will provide
interface IframeServices {
  'ui.render': (component: string, props: any) => Promise<string>;
  'data.fetch': (url: string) => Promise<any>;
  'auth.validate': (token: string) => Promise<boolean>;
  'storage.get': (key: string) => Promise<any>;
  'storage.set': (key: string, value: any) => Promise<void>;
}

// Create and connect to an iframe
export async function setupIframeCommunication() {
  // Create an iframe
  const iframe = document.createElement('iframe');
  iframe.src = '/iframe-page.html';
  iframe.style.width = '100%';
  iframe.style.height = '400px';
  iframe.style.border = '1px solid #ccc';
  
  // Add iframe to the page
  document.body.appendChild(iframe);

  // Wait for iframe to load
  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
  });

  // Create a portal for the iframe
  const portal = PortalFactory.createIframePortal(iframe);

  // Create a proxy for remote service calls
  const proxy = new PortalServiceBusProxy(portal);
  await proxy.connect();

  // Create a typed proxy with our service interface
  const iframeServices = proxy.createProxy() as IframeServices;

  // Use the iframe services
  try {
    // UI rendering
    const html = await iframeServices['ui.render']('button', {
      text: 'Click me',
      onClick: 'handleClick'
    });
    console.log('Rendered HTML:', html);

    // Data fetching
    const data = await iframeServices['data.fetch']('https://api.example.com/data');
    console.log('Fetched data:', data);

    // Authentication
    const isValid = await iframeServices['auth.validate']('user-token-123');
    console.log('Token valid:', isValid);

    // Storage operations
    await iframeServices['storage.set']('user-preference', { theme: 'dark' });
    const preference = await iframeServices['storage.get']('user-preference');
    console.log('User preference:', preference);

  } catch (error) {
    console.error('Iframe communication error:', error);
  }

  return { iframe, iframeServices };
}

// Example of handling iframe events
export function setupIframeEventHandling(iframe: HTMLIFrameElement) {
  iframe.addEventListener('load', () => {
    console.log('Iframe loaded successfully');
  });

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.source === iframe.contentWindow) {
      console.log('Message from iframe:', event.data);
    }
  });
}

// ============================================================================
// IFRAME PAGE (iframe-page.html)
// ============================================================================

// This would be in a separate iframe-page.html file
export const iframePageCode = `
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Portal Example</title>
    <script type="module">
        import { PortalFactory, PortalServiceBusConnector } from '@cardos/service-bus-portal';

        // Create a portal for the parent window
        const portal = PortalFactory.createIframePortal(window.parent);

        // Create a connector to handle service requests
        const connector = new PortalServiceBusConnector(portal);

        // Define the services that this iframe provides
        const services = {
            'ui.render': async (component: string, props: any) => {
                // Simple component rendering
                switch (component) {
                    case 'button':
                        return \`<button onclick="\${props.onClick}">\${props.text}</button>\`;
                    case 'input':
                        return \`<input type="\${props.type || 'text'}" placeholder="\${props.placeholder || ''}" />\`;
                    case 'card':
                        return \`<div class="card">\${props.content}</div>\`;
                    default:
                        return \`<div>Unknown component: \${component}</div>\`;
                }
            },

            'data.fetch': async (url: string) => {
                // Simulate data fetching
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            id: 1,
                            name: 'Sample Data',
                            timestamp: new Date().toISOString()
                        });
                    }, 100);
                });
            },

            'auth.validate': async (token: string) => {
                // Simple token validation
                return token.length > 10 && token.includes('user');
            },

            'storage.get': async (key: string) => {
                // Get from localStorage
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            },

            'storage.set': async (key: string, value: any) => {
                // Set to localStorage
                localStorage.setItem(key, JSON.stringify(value));
            }
        };

        // Connect the services
        connector.connect(services);

        // Send a message to parent when ready
        window.parent.postMessage({
            type: 'iframe-ready',
            services: Object.keys(services)
        }, '*');

        // Handle iframe lifecycle
        window.addEventListener('beforeunload', () => {
            connector.disconnect();
        });
    </script>
</head>
<body>
    <div id="app">
        <h2>Iframe Portal Example</h2>
        <p>This iframe provides services to the parent window.</p>
        <div id="status">Ready to serve requests</div>
    </div>
</body>
</html>
`;

// ============================================================================
// BIDIRECTIONAL COMMUNICATION EXAMPLE
// ============================================================================

// Example of bidirectional communication between parent and iframe
export async function setupBidirectionalCommunication() {
  const { iframe, iframeServices } = await setupIframeCommunication();

  // Create a portal for the parent to provide services to iframe
  const parentPortal = PortalFactory.createIframePortal(window);
  const parentConnector = new PortalServiceBusConnector(parentPortal);

  // Define services that the parent provides to iframe
  const parentServices = {
    'parent.notify': async (message: string) => {
      console.log('Parent received notification:', message);
      return 'Notification received';
    },

    'parent.getData': async () => {
      return {
        user: 'John Doe',
        settings: { theme: 'light', language: 'en' }
      };
    },

    'parent.updateUI': async (updates: any) => {
      // Update parent page UI
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.textContent = \`Updated: \${JSON.stringify(updates)}\`;
      }
      return 'UI updated';
    }
  };

  // Connect parent services
  parentConnector.connect(parentServices);

  return { iframe, iframeServices, parentConnector };
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

export async function runIframeExample() {
  console.log('Starting Iframe example...');

  // Setup bidirectional communication
  const { iframe, iframeServices, parentConnector } = await setupBidirectionalCommunication();

  // Setup event handling
  setupIframeEventHandling(iframe);

  // Demonstrate iframe services
  const promises = [
    iframeServices['ui.render']('button', { text: 'Test Button', onClick: 'test()' }),
    iframeServices['data.fetch']('https://api.example.com/users'),
    iframeServices['auth.validate']('user-token-123'),
    iframeServices['storage.set']('test-key', { value: 'test-data' }),
    iframeServices['storage.get']('test-key')
  ];

  const results = await Promise.all(promises);
  console.log('All iframe operations completed:', results);

  // Send a message to iframe
  iframe.contentWindow?.postMessage({
    type: 'parent-message',
    data: 'Hello from parent!'
  }, '*');

  return { iframe, iframeServices, parentConnector };
}

// ============================================================================
// MULTIPLE IFRAMES EXAMPLE
// ============================================================================

export async function setupMultipleIframes() {
  const iframes = [];
  const services = [];

  // Create multiple iframes
  for (let i = 0; i < 3; i++) {
    const iframe = document.createElement('iframe');
    iframe.src = \`/iframe-page-\${i}.html\`;
    iframe.style.width = '300px';
    iframe.style.height = '200px';
    iframe.style.margin = '10px';
    iframe.style.border = '1px solid #ccc';
    
    document.body.appendChild(iframe);

    // Wait for iframe to load
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
    });

    // Setup communication for each iframe
    const portal = PortalFactory.createIframePortal(iframe);
    const proxy = new PortalServiceBusProxy(portal);
    await proxy.connect();

    iframes.push(iframe);
    services.push(proxy.createProxy());
  }

  // Use services from different iframes
  const results = await Promise.all([
    services[0]['ui.render']('button', { text: 'Iframe 1', onClick: 'click1()' }),
    services[1]['data.fetch']('https://api1.example.com/data'),
    services[2]['auth.validate']('token-123')
  ]);

  console.log('Multiple iframes results:', results);

  return { iframes, services };
} 