# 🚀 @super-ssr

Super SSR provides the missing pieces required to create SSR apps with Vite and your third party libraries of choice. It
is framework agnostic on the client and the server - use React, Solid, Hono, H3, Cloudflare, Bun, you name it.

Super SSR is split into two parts - a Vite plugin and a group of packages that help to organize common streaming
patterns (these are optional!).

## `@super-ssr/vite`

The Super SSR Vite plugin is barebones and (mostly) unopinionated by design. It can be used standalone, see the
[`bun-react-router`](examples/bun-react-router/README.md),
[`react-react-simple`](examples/react-router-simple/README.md), and
[`solid-router-simple`](examples/solid-router-simple/README.md) examples.

The goal of `@super-ssr/vite` is to close the small gaps that prevent Vite from being a delightful building block for
modern SSR apps, not to provide solutions for routing, deployment, etc.

**It is:**

- ✅ Framework agnostic on the client (use react, solid, etc)
- ✅ Framework agnostic on the server (use node 18+, hono, h3, cloudflare, bun, deno, etc)
- ✅ Simple "native" Vite - continue using `vite dev`, `vite build`, etc

**It enables:**

- Route based code-spliting with asset pre-loading
- Typescript + HMR support on the client AND server
- Elimates FOUC css issues during development
- Generates a `ssr-manifest.json` file during build that maps client route urls -> assets
- Provides a `assetsForRequest(url: string)` function that returns a list of assets critical to the given request

> ❗ A small disclaimer... what makes Super SSR great is that it doesn't try to do everything. This means Super SSR is
> intended for a specific audience. If you're looking for something quick and easy, Super SSR might not be for you. If
> you are looking to build a modern SSR app with your choice of 3rd party libraries for routing, head management, etc,
> then Super SSR might be right for you.

### Usage

`@super-ssr/vite` is mostly unopinionated, but does require 3 things:

#### Requirement 1 - a client entry file

This file should mount your application in the browser. For React it might look something like this:

```tsx
import { hydrateRoot } from 'react-dom/client';

import { App } from '~/app.tsx';

hydrateRoot(document, <App />);
```

#### Requirement 2 - a server entry file

A server entry who's default export includes a `fetch` function that accepts a
[Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and returns a
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object with your rendered or streamed app.

> `@super-ssr/vite` is focused on supporting the WinterCG standard. Modern node frameworks such as `Hono` and `h3`, as
> well as alternative runtimes such as `bun`, `deno`, `cloudflare`, and more should all work well with this pattern.

For React, it might look something like this:

```tsx
import { renderToString } from 'react-dom/server';

import { App } from '~/app.tsx';

export default {
  fetch(req: Request) {
    const html = renderToString(<App />);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  },
};
```

#### Requirement 3 - a routes file

Your routes file should export a `routes` object. By default `@super-ssr/vite` expects the `routes` object to conform to
the following shape:

```ts
type Route = {
  // path must adhere to the path-to-regex syntax
  path?: string;
  children?: Route[];

  // If lazy or component.preload point to a dynamic import, that route will be code split
  lazy?: () => Promise<any>;
  component?: {
    preload?: () => Promise<any>;
  };
};
```

`react-router` and `solid-router` both conform to this shape out of the box. You can provide your own `routerAdapter` if
your routes config does not - see [adapter-tanstack-router](packages/adapter-tanstack-router/README.md) for an example.

#### Finally, update your vite.config.js

Example:

```ts
import { superSsr } from '@super-ssr/vite/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // ... your other plugins

    // The plugin, with all of it's defaults.
    // You only need to set these options if they deviate from the defaults.
    superSsr({
      routesFile: './src/routes.tsx',
      clientEntry: './src/entry.client.tsx',
      serverFile: './src/server.ts',
      clientOutDir: 'dist/public',
      serverOutDir: 'dist',
      runtime: 'node',
      routerAdapter: defaultRouterAdapter,
    }),
  ],
});
```

See [`bun-react-router`](examples/bun-react-router/README.md),
[`react-react-simple`](examples/react-router-simple/README.md), and
[`solid-router-simple`](examples/solid-router-simple/README.md) for more concrete examples.

## `@super-ssr/renderer`

The Super SSR renderer provides building blocks that make it easier to develop streaming SSR apps. It is client and
server framework agnostic, so long as the server runtime supports web streams and AsyncLocalStorage (node 18+, bun,
deno, cloudflare, vercel, etc).

See the [streaming-kitchen-sink](examples/streaming-kitchen-sink/README.md) example for a look at how everything can
work together in practice.

### Usage

`@super-ssr/renderer` exports a `createApp` function that allows you to compose all the pieces necessary to render a SSR
streamed application. For example:

**app.tsx**

```tsx
// In this case we're using the `react` renderer, which simply wraps @super-ssr/renderer with a react specific stream function
import { createApp } from '@super-ssr/react';

export const { clientHandler, serverHandler, ctx } = createApp({
  // Usually a router plugin will provide the appRenderer, but you can always provide your own if needed
  appRenderer:
    ({ req }) =>
    () =>
      <div>My App</div>,

  plugins: [
    // ... your plugins, or 3rd party plugins
    // more on the plugin shape below
  ],
});
```

**entry.client.tsx**

```tsx
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.tsx';

async function hydrate() {
  const renderApp = await clientHandler();

  hydrateRoot(document, renderApp());
}

void hydrate();
```

**server.ts**

```tsx
import { serverHandler } from '~/app.tsx';

export default {
  fetch(req: Request) {
    const appStream = await serverHandler({ req });

    return new Response(appStream);
  },
};
```

With the above steps you get a streaming react app with support for lazy asset preloading. However, plugins are where
`@super-ssr/renderer` really shines.

### Plugins

Plugins can:

- Hook into the client and server rendering in a standardized way
- Extend a typesafe `ctx` object that is made available on the client and the server, even outside of the rendering tree
  (for example in router loader functions)

**Plugin Shape**

The snippet below has been simplified - see the [renderer types](packages/renderer/src/types.ts) file for the full
plugin signature.

```ts
export type RenderPlugin<C extends Record<string, unknown>, AC extends Record<string, unknown>> = {
  id: string;

  /**
   * Create a context object that will be passed to all of this plugin's hooks.
   */
  createCtx?: Function;

  hooks?: {
    /**
     * Extend the app ctx object with additional properties. The app ctx object is made available
     * to the end application on the server and the client.
     */
    'app:extendCtx'?: Function;

    /**
     * Wrap the app component with a higher-order component. This is useful for wrapping the app with providers, etc.
     */
    'app:wrap'?: Function;

    /**
     * Render the final inner-most app component. Only one plugin may do this - usually a routing plugin.
     */
    'app:render'?: Function;

    /**
     * Return a string or ReactElement to emit some HTML into the document's head.
     */
    'ssr:emitToHead'?: Function;

    /**
     * Return a string to emit into the SSR stream just before the rendering
     * framework (react, solid, etc) emits a chunk of the page.
     */
    'ssr:emitBeforeFlush'?: Function;

    /**
     * Return a string to emit some HTML into the document's body before it is closed.
     */
    'ssr:emitToBody'?: Function;
  };
};
```

### Officially supported renderer packages

- `@super-ssr/renderer`: The core renderer - usually you will use a framework specific package, such as
  `@super-ssr/react` or `@super-ssr/solid`.
- `@super-ssr/react`: Wraps `@super-ssr/renderer` for react applications.
- `@super-ssr/solid`: Wraps `@super-ssr/renderer` for solidjs applications.
- `@super-ssr/plugin-react-router`
- `@super-ssr/plugin-solid-router`
- `@super-ssr/plugin-tanstack-query`
- `@super-ssr/plugin-trpc-react`
- `@super-ssr/plugin-unhead`

## Inspiration

Many thanks to these awesome libraries! Please check them out - they provided inspiration as I navigated my first Vite
plugin.

- https://github.com/Lomray-Software/vite-ssr-boost
- https://github.com/nksaraf/vinxi
- https://github.com/fastify/fastify-vite
