# Migration Guide

## From Internal Portal to @cardos/service-bus-portal

This guide helps you migrate from the internal portal implementation to the new `@cardos/service-bus-portal` npm package.

## What Changed

The portal system has been extracted into a standalone npm package for better reusability and maintainability.

### Before (Internal Implementation)
```typescript
import { PortalFactory, PortalServiceBusProxy } from '../portal';
```

### After (NPM Package)
```typescript
import { PortalFactory, PortalServiceBusProxy } from '@cardos/service-bus-portal';
```

## Migration Steps

### 1. Update Imports

Replace all imports from the internal portal directory:

```typescript
// Old
import { PortalFactory } from 'src/common/lib/service-bus/portal';
import { PortalServiceBusProxy } from 'src/common/lib/service-bus/portal';
import { PortalComposer } from 'src/common/lib/service-bus/portal';

// New
import { PortalFactory, PortalServiceBusProxy, PortalComposer } from '@cardos/service-bus-portal';
```

### 2. Update Package Dependencies

The package is already added to the workspace dependencies:

```json
{
  "dependencies": {
    "@cardos/service-bus-portal": "workspace:*"
  }
}
```

### 3. Verify Usage

The API remains the same, so no code changes are needed:

```typescript
// This code works exactly the same
const portal = PortalFactory.createWorkerPortal(worker);
const proxy = new PortalServiceBusProxy(portal);
await proxy.connect();
const serviceProxy = proxy.createProxy() as MyServices;
```

## Benefits of the New Package

1. **Reusability**: Can be used in any project that needs cross-context communication
2. **Version Management**: Independent versioning and updates
3. **Type Safety**: Complete TypeScript definitions
4. **Documentation**: Comprehensive English documentation
5. **Testing**: Can be tested independently
6. **Distribution**: Available as an npm package

## Package Structure

```
packages/service-bus-portal/
├── src/
│   ├── types.ts           # Type definitions
│   ├── core.ts            # Core implementations
│   ├── service-bus.ts     # Service bus adapters
│   ├── factory.ts         # Factory and composer
│   └── index.ts           # Main exports
├── examples/
│   └── basic-usage.ts     # Usage examples
├── dist/                  # Built files
├── package.json           # Package configuration
├── README.md              # Documentation
└── LICENSE                # MIT License
```

## Publishing

To publish a new version:

1. Update version in `package.json`
2. Run `pnpm build` to build the package
3. Run `./scripts/publish.sh` to publish to npm

## Support

For issues or questions about the portal service bus package, please refer to:
- [README.md](README.md) - Complete documentation
- [Examples](examples/) - Usage examples
- [GitHub Issues](https://github.com/Peiiii/AgentVerse/issues) - Bug reports and feature requests 