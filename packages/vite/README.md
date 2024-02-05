# `@ssrx/vite`

A Vite plugin that improves the DX of developing SSR apps.

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
  request (along with preload links, etc). You can use this to inject the appropriate asset tags.

> ❗ A small disclaimer... SSRx intentionally does not try to do everything and is intended for a specific audience. If
> you're looking for a full-fledged framework, SSRx might not be for you. If you are looking to build a modern SSR app
> with your choice of 3rd party libraries for routing, head management, etc, then SSRx might be right for you.

> ❗ Remix is transitioning to Vite, so for Vite + React Router projects I now recommend Remix as the best-in-class
> option.

## Examples

The SSRx Vite plugin is barebones and (mostly) unopinionated by design, and can be used standalone. See the
[`bun-react-router`](/examples/bun-react-router/README.md),
[`react-router-simple`](/examples/react-router-simple/README.md),
[`tanstack-router-simple`](/examples/tanstack-router-simple/README.md), and
[`solid-router-simple`](/examples/solid-router-simple/README.md) examples.

## Usage

`@ssrx/vite` is mostly unopinionated, but does require 3 things (the file locations are configurable, defaults below):

<details>
<summary>Install deps via yarn, npm, etc</summary>

```
yarn add @ssrx/vite
yarn add -D vite@5
```

</details>

<details>
<summary>Requirement #1 - a client entry file, `src/entry.client.tsx`</summary>

This file should mount your application in the browser. For React it might look something like this:

```tsx
// src/entry.client.tsx

import { hydrateRoot } from 'react-dom/client';

import { App } from '~/app.tsx';

hydrateRoot(document, <App />);
```

</details>

<details>
<summary>Requirement #2 - a server file, `src/server.ts`</summary>

A server entry who's default export includes a `fetch` function that accepts a
[Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and returns a
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object with your rendered or streamed app.

> `@ssrx/vite` is focused on supporting the WinterCG standard. Modern node frameworks such as `Hono` and `h3`, as well
> as alternative runtimes such as `bun`, `deno`, `cloudflare`, and more should all work well with this pattern.

For React, it might look something like this:

```tsx
// src/server.ts

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

</details>

<details>
<summary>Requirement #3 - a routes file, `src/routes.tsx`</summary>

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
your routes config does not - see [plugin-tanstack-router](/packages/plugin-tanstack-router/README.md) for an example.

</details>

<details>
<summary>Finally, update your vite.config.js</summary>

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

</details>

## Runtimes

The `ssrx` vite plugin accepts a `runtime` option. The available values are:

- `node` (default)
- `edge`: adjusts Vite to bundle the server output into a single file, and sets resolve conditions that are more
  appropriate for ssr / server rendering in popular edge environments.
- `cf-pages`: adjust the output to be suitable for deployment to Cloudflare Pages, including generating sane
  `_routes.json` and `_headers` defaults.

## Inspiration

Many thanks to these awesome libraries! Please check them out - they provided inspiration as I navigated my first Vite
plugin.

- https://github.com/Lomray-Software/vite-ssr-boost
- https://github.com/nksaraf/vinxi
- https://github.com/fastify/fastify-vite
- https://github.com/honojs/vite-plugins/tree/main/packages/dev-server
