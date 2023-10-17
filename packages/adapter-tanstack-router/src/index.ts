import type { RouteInfo, RouterAdapter } from '@super-ssr/vite/types';
import type { AnyRoute } from '@tanstack/router-core';

import { transformPath } from './transform-path.ts';

export { lazyRouteComponent } from './lazy-route-component.ts';

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

  return routes.map(r => {
    // @ts-expect-error tanstack/router seem off here... r.path actually doesn't exist, and r.options.path does
    const path = transformPath(r.path || r.options.path);
    const component = r.options.component;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore ignore any type issues here
    const lazy = component?.preload;

    return {
      path,
      lazy,
      children: r.children ? normalizeRoutes(r.children) : undefined,
    };
  });
};
