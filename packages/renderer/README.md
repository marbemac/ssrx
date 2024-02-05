# `@ssrx/renderer`

The SSRx renderer establishes some patterns to hook into the lifecycle of streaming SSR apps in a framework/library
agnostic way. It is client and server framework agnostic, so long as the server runtime supports web streams and
AsyncLocalStorage (node 18+, bun, deno, cloudflare, vercel, etc). A handful of renderer plugins for common libraries are
maintained in this repo.

See the [react-router-kitchen-sink](/examples/react-router-kitchen-sink/README.md) and
[remix-vite](/examples/remix-vite/README.md) examples for a look at how everything can work together in practice.

## Usage

`@ssrx/renderer` exports a `createApp` function that allows you to compose all the pieces necessary to render a SSR
streamed application.

An example with React (Solid works almost exactly the same):

<details>
<summary>src/app.tsx</summary>

```tsx
// In this case we're using the `react` renderer, which simply wraps @ssrx/renderer with a react specific stream function
import { createApp } from '@ssrx/react';
import { assetsPlugin } from '@ssrx/renderer/assets';

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

</details>

<details>
<summary>src/entry.client.tsx</summary>

```tsx
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.tsx';

void hydrate();

async function hydrate() {
  const app = await clientHandler();

  hydrateRoot(document, app());
}
```

</details>

<details>
<summary>src/server.ts</summary>

```tsx
import { serverHandler } from '~/app.tsx';

export default {
  fetch(req: Request) {
    const { stream, statusCode } = await serverHandler({ req });

    return new Response(stream, { status: statusCode(), headers: { 'Content-Type': 'text/html' } });
  },
};
```

</details>

With the above steps you get a streaming react app with support for lazy asset preloading. However, plugins are where
`@ssrx/renderer` really shines.

## Plugins

Plugins can:

- Hook into the client and server rendering in a standardized way
- Extend a typesafe `ctx` object that is made available on the client and the server, even outside of the rendering tree
  (for example in router loader functions). This is accomplished via a proxy that is exposed on the window in the client
  context, and via async local storage on the server.

**Plugin Shape**

See the [renderer types](/packages/renderer/src/types.ts) file for the full plugin signature.

```ts
export type RenderPlugin = {
  id: string;

  /**
   * Called once per request.
   */
  hooksForReq: (props: {
    req: Request;
    meta?: SSRx.ReqMeta;
    renderProps: SSRx.RenderProps;
    ctx: Record<string, unknown>;
  }) => {
    // Called on the client and the server
    common?: {
      /**
       * Extend the app ctx object with additional properties. Consider this "external" context - it is made available
       * to the end application on the server and the client.
       */
      extendAppCtx?: () => Record<string, unknown>;

      /**
       * Wrap the app component with a higher-order component. This is useful for wrapping the app with providers, etc.
       */
      wrapApp?: (props: { children: () => Config['jsxElement'] }) => Config['jsxElement'];

      /**
       * Render the final inner-most app component. Only one plugin may do this - usually a routing plugin.
       */
      renderApp?: () => (() => Config['jsxElement']) | Promise<() => Config['jsxElement']>;
    };

    // Only called on the server
    server?: {
      /**
       * Return a string to emit some HTML into the SSR stream just before the document's closing </head> tag.
       *
       * Triggers once per request.
       */
      emitToDocumentHead?: Promise<string | undefined> | string | undefined;

      /**
       * Return a string to emit into the SSR stream just before the rendering
       * framework (react, solid, etc) emits a chunk of the page.
       *
       * Triggers one or more times per request.
       */
      emitBeforeStreamChunk?: Promise<string | undefined> | string | undefined;

      /**
       * Return a string to emit some HTML to the document body, after the client renderer's first flush.
       *
       * Triggers once per request.
       */
      emitToDocumentBody?: Promise<string | undefined> | string | undefined;

      /**
       * Runs when the stream is done processing.
       */
      onStreamComplete?: Promise<void> | void;
    };
  };
};
```

## Directory

| Package                                                          | Release Notes                                                                                                                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@ssrx/renderer](/packages/renderer)                             | [![@ssrx/renderer version](https://img.shields.io/npm/v/@ssrx/renderer.svg?label=%20)](/packages/renderer/CHANGELOG.md)                                           |
| [@ssrx/react](/packages/react)                                   | [![@ssrx/react version](https://img.shields.io/npm/v/@ssrx/react.svg?label=%20)](/packages/react/CHANGELOG.md)                                                    |
| [@ssrx/remix](/packages/remix)                                   | [![@ssrx/remix version](https://img.shields.io/npm/v/@ssrx/remix.svg?label=%20)](/packages/remix/CHANGELOG.md)                                                    |
| [@ssrx/solid](/packages/solid)                                   | [![@ssrx/solid version](https://img.shields.io/npm/v/@ssrx/solid.svg?label=%20)](/packages/solid/CHANGELOG.md)                                                    |
| [@ssrx/streaming](/packages/streaming)                           | [![@ssrx/streaming version](https://img.shields.io/npm/v/@ssrx/streaming.svg?label=%20)](/packages/streaming/CHANGELOG.md)                                        |
| [@ssrx/trpc-react-query](/packages/trpc-react-query)             | [![@ssrx/trpc-react-query version](https://img.shields.io/npm/v/@ssrx/trpc-react-query.svg?label=%20)](/packages/trpc-react-query/CHANGELOG.md)                   |
| [@ssrx/plugin-react-router](/packages/plugin-react-router)       | [![@ssrx/plugin-react-router version](https://img.shields.io/npm/v/@ssrx/plugin-react-router.svg?label=%20)](/packages/solid/CHANGELOG.md)                        |
| [@ssrx/plugin-solid-router](/packages/plugin-solid-router)       | [![@ssrx/plugin-solid-router version](https://img.shields.io/npm/v/@ssrx/plugin-solid-router.svg?label=%20)](/packages/plugin-solid-router/CHANGELOG.md)          |
| [@ssrx/plugin-tanstack-query](/packages/plugin-tanstack-query)   | [![@ssrx/plugin-tanstack-query version](https://img.shields.io/npm/v/@ssrx/plugin-tanstack-query.svg?label=%20)](/packages/plugin-tanstack-query/CHANGELOG.md)    |
| [@ssrx/plugin-tanstack-router](/packages/plugin-tanstack-router) | [![@ssrx/plugin-tanstack-router version](https://img.shields.io/npm/v/@ssrx/plugin-tanstack-router.svg?label=%20)](/packages/plugin-tanstack-router/CHANGELOG.md) |
| [@ssrx/plugin-trpc-react](/packages/plugin-trpc-react)           | [![@ssrx/plugin-trpc-react version](https://img.shields.io/npm/v/@ssrx/plugin-trpc-react.svg?label=%20)](/packages/plugin-trpc-react/CHANGELOG.md)                |
| [@ssrx/plugin-unhead](/packages/plugin-unhead)                   | [![@ssrx/plugin-unhead version](https://img.shields.io/npm/v/@ssrx/plugin-unhead.svg?label=%20)](/packages/plugin-unhead/CHANGELOG.md)                            |
