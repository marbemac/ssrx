# 🚀 Welcome to SSRx

SSRx provides the missing pieces required to create SSR apps with Vite and your third party libraries of choice. It is
framework agnostic on the client and the server - use React, Solid, Hono, H3, Cloudflare, Bun, you name it.

SSRx is split into two parts that can be used independently, or together:

1. `@ssrx/vite` - a Vite plugin to improve the DX of developing SSR apps (can be used on it's own).
2. `@ssrx/renderer` - establishes some patterns to hook into the lifecycle of streaming SSR apps in a framework/library
   agnostic way. A handful of renderer plugins for common libraries are maintained in this repo.

## `@ssrx/vite`

> ❗ Remix is transitioning to Vite, so for Vite + React Router projects I now recommend Remix as the best-in-class
> option.

The SSRx Vite plugin is barebones and (mostly) unopinionated by design. It can be used standalone, see the
[`bun-react-router`](examples/bun-react-router/README.md),
[`react-router-simple`](examples/react-router-simple/README.md),
[`tanstack-router-simple`](examples/tanstack-router-simple/README.md), and
[`solid-router-simple`](examples/solid-router-simple/README.md) examples.

The goal of `@ssrx/vite` is to close the small gaps that prevent Vite from being a delightful building block for modern
SSR apps, not to provide solutions for routing, deployment, etc.

**It is:**

- ✅ Framework agnostic on the client (use react, solid, etc)
- ✅ Framework agnostic on the server (use node 18+, hono, h3, cloudflare, bun, deno, etc)
- ✅ Simple "native" Vite - continue using `vite dev`, `vite build`, etc

**It enables:**

- Route based code-spliting with asset pre-loading
- Typescript + HMR support on the client AND server
- Elimates FOUC css issues during development
- Generates a `ssr-manifest.json` file during build that maps client route urls -> assets
- Provides a `assetsForRequest(url: string)` function on the server that returns a list of assets critical to the given
  request (along with preload links, etc)

> ❗ A small disclaimer... SSRx intentionally does not try to do everything and is intended for a specific audience. If
> you're looking for a full-fledged framework, SSRx might not be for you. If you are looking to build a modern SSR app
> with your choice of 3rd party libraries for routing, head management, etc, then SSRx might be right for you.

### Usage

First, install deps via yarn, npm, etc, along these lines:

```
yarn add @ssrx/vite
yarn add -D vite@5
```

`@ssrx/vite` is mostly unopinionated, but does require 3 things:

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

> `@ssrx/vite` is focused on supporting the WinterCG standard. Modern node frameworks such as `Hono` and `h3`, as well
> as alternative runtimes such as `bun`, `deno`, `cloudflare`, and more should all work well with this pattern.

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

Your routes file should export a `routes` object. By default `@ssrx/vite` expects the `routes` object to conform to the
following shape:

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
your routes config does not - see [plugin-tanstack-router](packages/plugin-tanstack-router/README.md) for an example.

#### Finally, update your vite.config.js

Example:

```ts
import { ssrx } from '@ssrx/vite/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // ... your other plugins

    // The plugin, with all of it's defaults.
    // You only need to set these options if they deviate from the defaults.
    ssrx({
      routesFile: 'src/routes.tsx',
      clientEntry: 'src/entry.client.tsx',
      serverFile: 'src/server.ts',
      clientOutDir: 'dist/public',
      serverOutDir: 'dist',
      runtime: 'node',
      routerAdapter: defaultRouterAdapter,
    }),
  ],
});
```

See [`bun-react-router`](examples/bun-react-router/README.md),
[`react-router-simple`](examples/react-router-simple/README.md),
[`tanstack-router-simple`](examples/tanstack-router-simple/README.md), and
[`solid-router-simple`](examples/solid-router-simple/README.md) for more concrete examples.

### Runtimes

The `ssrx` vite plugin accepts a `runtime` option.

Setting the value to `edge` will adjust vite to bundle the server output into a single file, and set resolve conditions
more appropriate for ssr / server rendering in popular edge environments.

Setting the value to `cf-pages` will adjust the output to be suitable for deployment to Cloudflare Pages, including
generating sane `_routes.json` and `_headers` defaults.

## `@ssrx/renderer`

The SSRx renderer provides building blocks that make it easier to develop streaming SSR apps. It is client and server
framework agnostic, so long as the server runtime supports web streams and AsyncLocalStorage (node 18+, bun, deno,
cloudflare, vercel, etc).

See the [react-router-kitchen-sink](examples/react-router-kitchen-sink/README.md) and
[remix-vite](examples/remix-vite/README.md) examples for a look at how everything can work together in practice.

### Directory

| Package                                                         | Release Notes                                                                                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@ssrx/renderer](packages/renderer)                             | [![@ssrx/renderer version](https://img.shields.io/npm/v/@ssrx/renderer.svg?label=%20)](packages/renderer/CHANGELOG.md)                                           |
| [@ssrx/react](packages/react)                                   | [![@ssrx/react version](https://img.shields.io/npm/v/@ssrx/react.svg?label=%20)](packages/react/CHANGELOG.md)                                                    |
| [@ssrx/remix](packages/remix)                                   | [![@ssrx/remix version](https://img.shields.io/npm/v/@ssrx/remix.svg?label=%20)](packages/remix/CHANGELOG.md)                                                    |
| [@ssrx/solid](packages/solid)                                   | [![@ssrx/solid version](https://img.shields.io/npm/v/@ssrx/solid.svg?label=%20)](packages/solid/CHANGELOG.md)                                                    |
| [@ssrx/streaming](packages/streaming)                           | [![@ssrx/streaming version](https://img.shields.io/npm/v/@ssrx/streaming.svg?label=%20)](packages/streaming/CHANGELOG.md)                                        |
| [@ssrx/trpc-react-query](packages/trpc-react-query)             | [![@ssrx/trpc-react-query version](https://img.shields.io/npm/v/@ssrx/trpc-react-query.svg?label=%20)](packages/trpc-react-query/CHANGELOG.md)                   |
| [@ssrx/plugin-react-router](packages/plugin-react-router)       | [![@ssrx/plugin-react-router version](https://img.shields.io/npm/v/@ssrx/plugin-react-router.svg?label=%20)](packages/solid/CHANGELOG.md)                        |
| [@ssrx/plugin-solid-router](packages/plugin-solid-router)       | [![@ssrx/plugin-solid-router version](https://img.shields.io/npm/v/@ssrx/plugin-solid-router.svg?label=%20)](packages/plugin-solid-router/CHANGELOG.md)          |
| [@ssrx/plugin-tanstack-query](packages/plugin-tanstack-query)   | [![@ssrx/plugin-tanstack-query version](https://img.shields.io/npm/v/@ssrx/plugin-tanstack-query.svg?label=%20)](packages/plugin-tanstack-query/CHANGELOG.md)    |
| [@ssrx/plugin-tanstack-router](packages/plugin-tanstack-router) | [![@ssrx/plugin-tanstack-router version](https://img.shields.io/npm/v/@ssrx/plugin-tanstack-router.svg?label=%20)](packages/plugin-tanstack-router/CHANGELOG.md) |
| [@ssrx/plugin-trpc-react](packages/plugin-trpc-react)           | [![@ssrx/plugin-trpc-react version](https://img.shields.io/npm/v/@ssrx/plugin-trpc-react.svg?label=%20)](packages/plugin-trpc-react/CHANGELOG.md)                |
| [@ssrx/plugin-unhead](packages/plugin-unhead)                   | [![@ssrx/plugin-unhead version](https://img.shields.io/npm/v/@ssrx/plugin-unhead.svg?label=%20)](packages/plugin-unhead/CHANGELOG.md)                            |

### Usage

`@ssrx/renderer` exports a `createApp` function that allows you to compose all the pieces necessary to render a SSR
streamed application. For example:

**app.tsx**

```tsx
// In this case we're using the `react` renderer, which simply wraps @ssrx/renderer with a react specific stream function
import { createApp } from '@ssrx/react';
import { assetsPlugin } from '@ssrx/vite/renderer';

export const { clientHandler, serverHandler, ctx } = createApp({
  // Usually a router plugin will provide the appRenderer, but you can always provide your own if needed
  appRenderer:
    ({ req }) =>
    () =>
      <div>My App</div>,

  plugins: [
    // If you are also using `@ssrx/vite`, this plugin automatically injects js/css assets into your html stream
    assetsPlugin(),

    // ... your plugins, or 3rd party plugins. More on the plugin shape below
  ],
});
```

**entry.client.tsx**

```tsx
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.tsx';

void hydrate();

async function hydrate() {
  const app = await clientHandler();

  hydrateRoot(document, app());
}
```

**server.ts**

```tsx
import { serverHandler } from '~/app.tsx';

export default {
  fetch(req: Request) {
    const { stream, statusCode } = await serverHandler({ req });

    return new Response(stream, { status: statusCode(), headers: { 'Content-Type': 'text/html' } });
  },
};
```

With the above steps you get a streaming react app with support for lazy asset preloading. However, plugins are where
`@ssrx/renderer` really shines.

### Plugins

Plugins can:

- Hook into the client and server rendering in a standardized way
- Extend a typesafe `ctx` object that is made available on the client and the server, even outside of the rendering tree
  (for example in router loader functions). This is accomplished via a proxy that is exposed on the window in the client
  context, and via async local storage on the server.

**Plugin Shape**

The snippet below has been simplified - see the [renderer types](packages/renderer/src/types.ts) file for the full
plugin signature.

```ts
export type RenderPlugin<C extends Record<string, unknown>, AC extends Record<string, unknown>> = {
  id: string;

  /**
   * Create a context object that will be passed to all of this plugin's hooks. Consider this "internal" context meant
   * for use in this plugin.
   *
   * Called once per request.
   */
  createCtx?: Function;

  hooks?: {
    /**
     * Extend the app ctx object with additional properties. Consider this "external" context - it is made available
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
     * Return a string to emit some HTML into the SSR stream just before the document's closing </head> tag.
     *
     * Triggers once per request.
     */
    'ssr:emitToHead'?: Function;

    /**
     * Return a string to emit into the SSR stream just before the rendering
     * framework (react, solid, etc) emits a chunk of the page.
     *
     * Triggers one or more times per request.
     */
    'ssr:emitBeforeFlush'?: Function;

    /**
     * Return a string to emit some HTML to the document body, after the client renderer's first flush.
     *
     * Triggers once per request.
     */
    'ssr:emitToBody'?: Function;

    /**
     * Runs when the stream is done processing.
     */
    'ssr:completed'?: Function;
  };
};
```

## Inspiration

Many thanks to these awesome libraries! Please check them out - they provided inspiration as I navigated my first Vite
plugin.

- https://github.com/Lomray-Software/vite-ssr-boost
- https://github.com/nksaraf/vinxi
- https://github.com/fastify/fastify-vite
- https://github.com/honojs/vite-plugins/tree/main/packages/dev-server
