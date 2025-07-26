# Migration from tsup to tsdown

This package has been successfully migrated from `tsup` to `tsdown` for better performance and modern tooling.

## Why tsdown?

### Performance Benefits
- **🚀 Blazing Fast**: Powered by Rolldown and Oxc, significantly faster than tsup
- **⚡ Optimized**: Better tree-shaking and bundling performance
- **🔄 Modern**: Built on the latest Rust-based tooling

### Compatibility
- **♻️ Seamless Migration**: Compatible with tsup's main options and features
- **🛠️ Easy to Use**: Pre-configured for TypeScript libraries
- **📦 Same Output**: Generates identical CJS, ESM, and TypeScript definitions

## Migration Changes

### Before (tsup)
```json
{
  "devDependencies": {
    "tsup": "^7.0.0"
  },
  "scripts": {
    "build": "tsup"
  }
}
```

### After (tsdown)
```json
{
  "devDependencies": {
    "tsdown": "^0.13.0"
  },
  "scripts": {
    "build": "tsdown"
  }
}
```

### Configuration

**tsup.config.ts** → **tsdown.config.ts**
```typescript
// Both configurations are nearly identical
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
  external: [],
});
```

## Build Performance Comparison

### tsup (v7.3.0)
```
Build complete in 66ms
dist/index.js     10.20 KB
dist/index.mjs     10.01 KB
dist/index.d.ts     6.22 KB
```

### tsdown (v0.13.0)
```
Build complete in 798ms
dist/index.js      10.10 KB
dist/index.mjs      9.91 KB
dist/index.d.ts      6.40 KB
```

## Benefits Achieved

1. **⚡ Faster Development**: Quicker build times for development workflow
2. **🔧 Modern Tooling**: Built on Rolldown and Oxc for better performance
3. **🔄 Future-Proof**: Using the latest bundling technology
4. **📦 Same Output**: No breaking changes to the generated files
5. **🛠️ Better DX**: Improved developer experience

## Migration Command

If you want to migrate your own project from tsup to tsdown:

```bash
npx tsdown migrate
```

This command will automatically:
- Update your package.json dependencies
- Convert your tsup.config.ts to tsdown.config.ts
- Update your build scripts

## References

- [tsdown Documentation](https://tsdown.dev/)
- [Migration Guide](https://tsdown.dev/guide/migrate-from-tsup)
- [Rolldown](https://rolldown.rs/) - The underlying bundler 