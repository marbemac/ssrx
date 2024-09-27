import { defineRenderPlugin } from '@ssrx/renderer';
import type { AnyRouter, Router } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/react-router';
import { clientOnly$, serverOnly$ } from 'vite-env-only/macros';

import { serializeLoaderData } from './start/serialization.tsx';
import { StartClient } from './start/StartClient.tsx';
import { StartServer } from './start/StartServer.tsx';

export const PLUGIN_ID = 'tanstackRouter' as const;

declare global {
  namespace SSRx {
    interface RenderProps {
      router: Router<any, any>;
    }
  }
}

const renderOnClient = clientOnly$(<TRouter extends AnyRouter>(props: { router: TRouter }) => (
  <StartClient {...props} />
));

const renderOnServer = serverOnly$(<TRouter extends AnyRouter>(props: { router: TRouter }) => (
  <StartServer {...props} />
));

export const tanstackRouterPlugin = () =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    hooksForReq: ({ req, renderProps }) => {
      return {
        common: {
          renderApp: async () => {
            const { router } = renderProps;

            /**
             * SERVER
             */
            if (import.meta.env.SSR) {
              // required if using defer() in loaders
              router.serializeLoaderData = serializeLoaderData;

              const url = new URL(req.url);
              const memoryHistory = createMemoryHistory({
                initialEntries: [url.pathname + url.search],
              });

              router.update({ history: memoryHistory });

              // Wait for the router to finish loading critical data
              await router.load();

              return () => renderOnServer!({ router });
            } else {
              /**
               * CLIENT
               */

              return () => renderOnClient!({ router });
            }
          },
        },

        server: {
          emitBeforeStreamChunk: async () => {
            const injectorPromises = renderProps.router.injectedHtml.map(d => (typeof d === 'function' ? d() : d));
            const injectors = await Promise.all(injectorPromises);
            renderProps.router.injectedHtml = [];
            return injectors.join('');
          },
        },
      };
    },
  });
