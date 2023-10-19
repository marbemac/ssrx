import { defineRenderPlugin } from '@ssrx/renderer';
import type { RouterProviderProps } from 'react-router-dom';
import { createBrowserRouter, matchRoutes, type RouteObject, RouterProvider } from 'react-router-dom';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server.js';

export const PLUGIN_ID = 'reactRouter' as const;

export type ReactRouterPluginOpts = {
  routes: RouteObject[];
  basename?: string;
  client?: { providerProps?: Omit<RouterProviderProps, 'router'> };
};

export const reactRouterPlugin = ({ routes, client, basename }: ReactRouterPluginOpts) =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      'app:render': async ({ req }) => {
        /**
         * SERVER
         */
        if (import.meta.env.SSR) {
          const { query, dataRoutes } = createStaticHandler(routes, { basename });
          const context = await query(req);

          if (context instanceof Response) {
            throw context;
          }

          const router = createStaticRouter(dataRoutes, context);

          return () => <StaticRouterProvider router={router} context={context} />;
        } else {
          /**
           * CLIENT
           */

          const lazyMatches = matchRoutes(
            routes,
            // @ts-expect-error ignore
            window.location,
          )?.filter(m => m.route.lazy);

          // Load the lazy matches and update the routes before creating your router
          // so we can hydrate the SSR-rendered content synchronously
          if (lazyMatches && lazyMatches?.length > 0) {
            await Promise.all(
              lazyMatches.map(async m => {
                const routeModule = await m.route.lazy!();
                Object.assign(m.route, { ...routeModule, lazy: undefined });
              }),
            );
          }

          const router = createBrowserRouter(routes, { basename });

          return () => <RouterProvider {...client?.providerProps} router={router} />;
        }
      },
    },
  });
