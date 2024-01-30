import type { RouteInfo, RouterAdapter } from '@ssrx/vite/types';
import type { AnyRoute } from '@tanstack/react-router';

import { transformPath } from './transform-path.ts';

type TanstackRouterAdapterOpts = {
  /**
   * The name of the export from the routes file.
   *
   * @default routeTree
   */
  exportName?: string;
};

export const tanstackRouterAdapter = (opts: TanstackRouterAdapterOpts = {}) => {
  const adapter: RouterAdapter<AnyRoute | AnyRoute[]> = {
    exportName: opts.exportName || 'routeTree',
    normalizeExternalRoutes(externalRoutes) {
      return normalizeRoutes(externalRoutes);
    },
  };

  return adapter;
};

const normalizeRoutes = (externalRoutes: AnyRoute | AnyRoute[]): RouteInfo[] => {
  const routes = Array.isArray(externalRoutes) ? externalRoutes : [externalRoutes];

  return routes.map(r => ({
    path: transformPath(r.path), // convert tanstack path syntax to syntax compatible with radix3 (mostly $ -> :)
    lazy: r.lazyFn || r.options.component?.preload, // cover the two ways of setting up lazy routes in tanstack
    children: r.children ? normalizeRoutes(r.children) : undefined,
  }));
};
