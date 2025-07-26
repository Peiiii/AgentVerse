# @cardos/service-bus-portal

A modular, composable cross-context communication system for Web Workers, iframes, Shared Workers, and Service Workers.

## Features

- 🔄 **Cross-Context Communication**: Seamless communication between different JavaScript execution contexts
- 🏗️ **Modular Architecture**: Clean separation of concerns with type-safe interfaces
- 🎯 **Multiple Portal Types**: Support for PostMessage, EventTarget, and custom communication channels
- 🔧 **Service Bus Integration**: Easy integration with existing service bus patterns
- 📦 **TypeScript First**: Full TypeScript support with comprehensive type definitions
- 🚀 **Lightweight**: Minimal bundle size with zero dependencies
- 🧪 **Testable**: Each component can be tested independently

## Installation

```bash
npm install @cardos/service-bus-portal
```

## Quick Start

### Basic Usage

```typescript
import { PortalFactory, PortalServiceBusProxy } from '@cardos/service-bus-portal';

// Create a portal for Web Worker communication
const portal = PortalFactory.createWorkerPortal(worker);

// Create a proxy for remote service calls
const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

// Create a typed proxy
const serviceProxy = proxy.createProxy() as MyServices;

// Use the proxy
const result = await serviceProxy['math.add'](5, 3);
```

### Multi-Portal Composition

```typescript
import { PortalComposer } from '@cardos/service-bus-portal';

const composer = new PortalComposer();

// Add multiple portals
composer.addPortal(workerPortal);
composer.addPortal(iframePortal);

// Create connectors for each portal
composer.createConnector(workerPortal.id, serviceBus);
composer.createConnector(iframePortal.id, serviceBus);

// Connect all portals
await composer.connectAll();
```

## Portal Types

### PostMessage Portal

For communication between different windows, workers, or iframes:

```typescript
const portal = PortalFactory.createPostMessagePortal(
  'my-portal',
  'window-to-worker',
  worker,
  { timeoutMs: 5000 }
);
```

### EventTarget Portal

For communication within the same context using custom events:

```typescript
const portal = PortalFactory.createEventTargetPortal(
  'event-portal',
  'window-to-window',
  document,
  'my-channel'
);
```

### Worker Portal

Convenient factory for Web Worker communication:

```typescript
const portal = PortalFactory.createWorkerPortal(worker);
```

### Iframe Portal

Convenient factory for iframe communication:

```typescript
const portal = PortalFactory.createIframePortal(iframe);
```

## Service Bus Integration

### Creating a Connector

Expose services through a portal:

```typescript
import { PortalServiceBusConnector } from '@cardos/service-bus-portal';

const connector = new PortalServiceBusConnector(portal, serviceBus);
await connector.connect();

### Creating a Proxy

Create a proxy for remote service calls:

```typescript
import { PortalServiceBusProxy } from '@cardos/service-bus-portal';

const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

const serviceProxy = proxy.createProxy() as MyServices;

## Advanced Configuration

### Portal Configuration

```typescript
const config = {
  timeoutMs: 15000,
  retryAttempts: 3,
  security: {
    allowedOrigins: ['https://myapp.com'],
    requireAuthentication: true
  },
  metadata: {
    version: '1.0.0',
    environment: 'production'
  }
};

const portal = PortalFactory.createPostMessagePortal(
  'secure-portal',
  'window-to-worker',
  worker,
  config
);
```

### Error Handling and Retries

```typescript
const robustProxy = new Proxy(serviceProxy, {
  get(target, prop) {
    const originalMethod = target[prop as keyof typeof target];
    
    if (typeof originalMethod === 'function') {
      return async (...args: unknown[]) => {
        let lastError: Error;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            return await (originalMethod as any)(...args);
          } catch (error) {
            lastError = error as Error;
            console.warn(`Service call failed (attempt ${attempt}/3):`, error);
            
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
        
        throw lastError!;
      };
    }
    
    return originalMethod;
  }
});
```

## Type Safety

### Defining Service Types

```typescript
interface MainThreadServices {
  'math.add': (a: number, b: number) => Promise<number>;
  'math.multiply': (a: number, b: number) => Promise<number>;
  'storage.getItem': (key: string) => Promise<string | null>;
  'storage.setItem': (key: string, value: string) => Promise<boolean>;
}

const serviceProxy = proxy.createProxy() as MainThreadServices;
```

## API Reference

### PortalFactory

#### `createPostMessagePortal(id, type, target, config?)`
Creates a PostMessage-based portal.

#### `createEventTargetPortal(id, type, eventTarget, channel, config?)`
Creates an EventTarget-based portal.

#### `createWorkerPortal(worker, config?)`
Creates a portal for Web Worker communication.

#### `createIframePortal(iframe, config?)`
Creates a portal for iframe communication.

### PortalServiceBusProxy

#### `constructor(portal)`
Creates a new proxy instance.

#### `connect()`
Connects the portal.

#### `disconnect()`
Disconnects the portal and cleans up pending requests.

#### `createProxy()`
Creates a proxy object for remote service calls.

### PortalComposer

#### `addPortal(portal)`
Adds a portal to the composer.

#### `removePortal(portalId)`
Removes a portal from the composer.

#### `createConnector(portalId, serviceBus)`
Creates a service bus connector for a portal.

#### `createProxy(portalId)`
Creates a service bus proxy for a portal.

#### `connectAll()`
Connects all portals.

#### `disconnectAll()`
Disconnects all portals.

## Examples

### Web Worker Communication

**Main Thread:**
```typescript
import { PortalFactory, PortalComposer } from '@cardos/service-bus-portal';

const composer = new PortalComposer();
const workerPortal = PortalFactory.createWorkerPortal(new Worker('/worker.js'));

composer.addPortal(workerPortal);
composer.createConnector(workerPortal.id, serviceBus);
await composer.connectAll();
```

**Worker:**
```typescript
import { PortalFactory, PortalServiceBusProxy } from '@cardos/service-bus-portal';

const portal = PortalFactory.createPostMessagePortal(
  'worker-to-main',
  'worker-to-window',
  self
);

const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

const serviceProxy = proxy.createProxy() as MainThreadServices;
const result = await serviceProxy['math.add'](5, 3);
```

### Iframe Communication

**Parent Window:**
```typescript
const iframePortal = PortalFactory.createIframePortal(iframe);
composer.addPortal(iframePortal);
composer.createConnector(iframePortal.id, serviceBus);
```

**Iframe:**
```typescript
const portal = PortalFactory.createPostMessagePortal(
  'iframe-to-parent',
  'iframe-to-window',
  parent
);

const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

const serviceProxy = proxy.createProxy() as ParentServices;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details. 