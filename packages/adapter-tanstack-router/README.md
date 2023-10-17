# @ssrx/adapter-tanstack-router

This adapter allows you to use tanstack router with `@ssrx/vite`. It supports code splitting and asset pre-loading so
long as you leverage the adjusted `lazyRouteComponent` function (see note at end of this readme).

## Usage

```ts
import { tanstackRouterAdapter } from '@ssrx/adapter-tanstack-router';
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

Import `lazyRouteComponent` from `@ssrx/adapter-tanstack-router` instead (or copy it into your project, it's a tiny
function).
