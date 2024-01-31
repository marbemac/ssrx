import { defineRenderPlugin } from '@ssrx/renderer';
import type { Router } from '@tanstack/react-router';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';

export const PLUGIN_ID = 'tanstackRouter' as const;

declare global {
  namespace SSRx {
    interface RenderProps {
      router: Router;
    }
  }
}

export const tanstackRouterPlugin = () =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      'app:render': async ({ req, renderProps }) => {
        const { router } = renderProps;

        /**
         * SERVER
         */
        if (import.meta.env.SSR) {
          const url = new URL(req.url);
          const memoryHistory = createMemoryHistory({
            initialEntries: [url.pathname + url.search],
          });

          router.update({ history: memoryHistory });

          // Wait for the router to finish loading critical data
          await router.load();

          return () => <RouterProvider router={router} />;
        } else {
          /**
           * CLIENT
           */

          if (!router.state.lastUpdated) {
            void router.hydrate();
          }

          return () => <RouterProvider router={router} />;
        }
      },

      'ssr:emitBeforeFlush': async ({ renderProps }) => {
        const injectorPromises = renderProps.router.injectedHtml.map(d => (typeof d === 'function' ? d() : d));
        const injectors = await Promise.all(injectorPromises);
        renderProps.router.injectedHtml = [];
        return injectors.join('');
      },
    },
  });
