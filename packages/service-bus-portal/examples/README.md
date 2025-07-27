# @cardos/service-bus-portal Examples

This directory contains comprehensive examples demonstrating how to use the `@cardos/service-bus-portal` package for cross-context communication.

## 📁 Example Files

### 1. `basic-usage.ts`
Basic examples showing fundamental portal usage:
- Simple Web Worker communication
- Multi-portal composition
- EventTarget portal usage

### 2. `worker-example.ts`
Complete Web Worker implementation:
- **Main Thread**: Setup and use worker services
- **Worker Thread**: Provide services to main thread
- **Features**: Math operations, data processing, image resizing
- **Progress Reporting**: Worker progress updates

### 3. `iframe-example.ts`
Complete iframe implementation:
- **Parent Page**: Setup and use iframe services
- **Iframe Page**: Provide services to parent
- **Features**: UI rendering, data fetching, authentication, storage
- **Bidirectional Communication**: Parent ↔ iframe messaging

### 4. `comprehensive-example.ts`
Advanced example combining all portal types:
- **PortalApplication Class**: Manages multiple portals
- **Worker Portal**: CPU-intensive operations
- **Iframe Portal**: UI and data services
- **EventTarget Portal**: Local communication
- **Portal Composer**: Orchestrates all portals

## 🚀 Quick Start

### Web Worker Example

```typescript
import { runWorkerExample } from './worker-example';

// Run the complete worker example
await runWorkerExample();
```

### Iframe Example

```typescript
import { runIframeExample } from './iframe-example';

// Run the complete iframe example
await runIframeExample();
```

### Comprehensive Example

```typescript
import { runComprehensiveExample } from './comprehensive-example';

// Run the comprehensive example with all portal types
await runComprehensiveExample();
```

## 🔧 Setup Requirements

### 1. Install the Package

```bash
npm install @cardos/service-bus-portal
```

### 2. Create Worker File

Create a `worker.ts` file for Web Worker examples:

```typescript
import { PortalFactory, PortalServiceBusConnector } from '@cardos/service-bus-portal';

// Create a portal for the main thread
const portal = PortalFactory.createWorkerPortal(self);

// Create a connector to handle service requests
const connector = new PortalServiceBusConnector(portal, {
  invoke: (key: string, ...args: unknown[]) => {
    // Your service implementations here
    switch (key) {
      case 'math.add':
        return (args[0] as number) + (args[1] as number);
      // ... other services
    }
  }
});

// Connect the services
connector.connect();
```

### 3. Create Iframe Page

Create an `iframe-page.html` file for iframe examples:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Portal Example</title>
    <script type="module">
        import { PortalFactory, PortalServiceBusConnector } from '@cardos/service-bus-portal';
        
        const portal = PortalFactory.createIframePortal(window.parent);
        const connector = new PortalServiceBusConnector(portal, {
            invoke: (key: string, ...args: unknown[]) => {
                // Your service implementations here
            }
        });
        
        connector.connect();
    </script>
</head>
<body>
    <div>Iframe Portal Ready</div>
</body>
</html>
```

## 📋 Service Patterns

### 1. Worker Services

```typescript
interface WorkerServices {
  'math.add': (a: number, b: number) => Promise<number>;
  'math.multiply': (a: number, b: number) => Promise<number>;
  'data.process': (data: string[]) => Promise<string[]>;
  'image.resize': (imageData: ImageData, width: number, height: number) => Promise<ImageData>;
}
```

### 2. Iframe Services

```typescript
interface IframeServices {
  'ui.render': (component: string, props: any) => Promise<string>;
  'data.fetch': (url: string) => Promise<any>;
  'auth.validate': (token: string) => Promise<boolean>;
  'storage.get': (key: string) => Promise<any>;
  'storage.set': (key: string, value: any) => Promise<void>;
}
```

### 3. Local Services

```typescript
interface LocalServices {
  'local.notify': (message: string) => Promise<string>;
  'local.getData': () => Promise<any>;
  'local.updateUI': (updates: any) => Promise<string>;
}
```

## 🔄 Communication Patterns

### 1. Unidirectional (Main → Worker/Iframe)

```typescript
// Create portal and proxy
const portal = PortalFactory.createWorkerPortal(worker);
const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

// Use services
const services = proxy.createProxy() as WorkerServices;
const result = await services['math.add'](5, 3);
```

### 2. Bidirectional (Main ↔ Worker/Iframe)

```typescript
// Main thread provides services to worker/iframe
const mainPortal = PortalFactory.createWorkerPortal(window);
const mainConnector = new PortalServiceBusConnector(mainPortal, mainServiceBus);
mainConnector.connect();

// Worker/iframe provides services to main
const workerPortal = PortalFactory.createWorkerPortal(worker);
const workerProxy = new PortalServiceBusProxy(workerPortal);
await workerProxy.connect();
```

### 3. Multi-Portal Composition

```typescript
const composer = new PortalComposer();

// Add multiple portals
composer.addPortal(workerPortal);
composer.addPortal(iframePortal);
composer.addPortal(localPortal);

// Create connectors for all
for (const portal of composer.listPortals()) {
  composer.createConnector(portal.id, serviceBus);
}

// Connect all portals
await composer.connectAll();
```

## 🛠️ Error Handling

```typescript
try {
  const result = await services['math.add'](5, 3);
  console.log('Success:', result);
} catch (error) {
  console.error('Service call failed:', error);
  
  // Handle specific error types
  if (error.message.includes('timeout')) {
    console.log('Request timed out');
  } else if (error.message.includes('not connected')) {
    console.log('Portal not connected');
  }
}
```

## 📊 Performance Considerations

### 1. Connection Management

```typescript
// Connect only when needed
const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();

// Disconnect when done
await proxy.disconnect();
```

### 2. Concurrent Operations

```typescript
// Run multiple operations concurrently
const promises = [
  services['math.add'](1, 2),
  services['math.multiply'](3, 4),
  services['data.process'](['a', 'b', 'c'])
];

const results = await Promise.all(promises);
```

### 3. Progress Reporting

```typescript
// Worker can report progress
worker.addEventListener('message', (event) => {
  if (event.data.type === 'progress') {
    console.log('Progress:', event.data.progress);
  }
});
```

## 🔍 Debugging

### 1. Enable Debug Logging

```typescript
// Add debug logging to your services
const services = {
  'math.add': async (a: number, b: number) => {
    console.log('Worker: math.add called with', a, b);
    const result = a + b;
    console.log('Worker: math.add returning', result);
    return result;
  }
};
```

### 2. Monitor Portal Status

```typescript
// Check portal connection status
if (portal.isConnected()) {
  console.log('Portal is connected');
} else {
  console.log('Portal is disconnected');
}
```

### 3. Handle Connection Events

```typescript
portal.onConnect(() => {
  console.log('Portal connected');
});

portal.onDisconnect(() => {
  console.log('Portal disconnected');
});
```

## 📚 Next Steps

1. **Explore the Examples**: Run each example to understand the patterns
2. **Customize Services**: Modify the service interfaces for your use case
3. **Add Error Handling**: Implement robust error handling for production
4. **Optimize Performance**: Use concurrent operations and connection pooling
5. **Add Type Safety**: Define comprehensive TypeScript interfaces

## 🤝 Contributing

Feel free to submit issues and enhancement requests for these examples! 