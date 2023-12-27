# @ssrx/plugin-tanstack-router

## Plugin

The runtime plugin is not yet implemented.

## Router Adapter

The router adapter allows you to use tanstack router with `@ssrx/vite`. It supports code splitting and asset pre-loading
so long as you leverage the adjusted `lazyRouteComponent` function (see note at end of this readme).

### Usage

```ts
import { tanstackRouterAdapter } from '@ssrx/plugin-tanstack-router/adapter';
import { ssrx } from '@ssrx/vite/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // ... your other plugins

    ssrx({
      routerAdapter: tanstackRouterAdapter({
        // Override this default if needed.. the adapter expects your routes file to export the
        // route tree on this named export
        exportName: 'routeTree',
      }),
    }),
  ],
});
```

Note, the `lazyRouteComponent` included in `@tanstack/react-router` does not preserve the identity of the original
dynamic import when it assigns the preload property.

Use the below version in your project:

```tsx
/**
 * Adapted from https://github.com/TanStack/router/blob/main/packages/react-router/src/lazyRouteComponent.tsx
 *
 * The comp.preload property has been adjusted to maintain a reference to the orginal lazy import function.
 */
export function lazyRouteComponent<T extends Record<string, any>, TKey extends keyof T = 'default'>(
  importer: () => Promise<T>,
  exportName?: TKey,
): T[TKey] extends (props: infer TProps) => any ? AsyncRouteComponent<TProps> : never {
  const load = importer;

  const lazyComp = React.lazy(async () => {
    const moduleExports = await load();
    const comp = moduleExports[exportName ?? 'default'];
    return {
      default: comp,
    };
  });

  (lazyComp as any).preload = load;

  return lazyComp as any;
}
```
