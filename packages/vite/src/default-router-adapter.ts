import type { RouteInfo, RouterAdapter } from './types.ts';

type DefaultRouterAdapterOpts = {
  /**
   * The name of the export from the routes file.
   *
   * @default routes
   */
  exportName?: string;
};

type DefaultRouterAdapterExternalRoute = {
  path?: string;
  children?: RouteInfo[];
  lazy?: () => Promise<any>;
  component?: {
    preload?: () => Promise<any>;
  };
};

/**
 * A default router adapter that covers common patterns.
 *
 * Expects route paths to be defined in a format that conforms to expectations of https://github.com/unjs/radix3.
 */
export const defaultRouterAdapter = (opts: DefaultRouterAdapterOpts = {}) => {
  const adapter: RouterAdapter<DefaultRouterAdapterExternalRoute | DefaultRouterAdapterExternalRoute[]> = {
    exportName: opts.exportName || 'routes',
    normalizeExternalRoutes(externalRoutes) {
      return normalizeRoutes(externalRoutes);
    },
  };

  return adapter;
};

const normalizeRoutes = (
  externalRoutes: DefaultRouterAdapterExternalRoute | DefaultRouterAdapterExternalRoute[],
): RouteInfo[] => {
  const routes = Array.isArray(externalRoutes) ? externalRoutes : [externalRoutes];

  const normalizedRoutes: RouteInfo[] = [];

  for (const r of routes) {
    if (!r || typeof r !== 'object') continue;

    // grab path from path property without transformation (so must conform to expectations of https://github.com/unjs/radix3)
    const path = r.path;

    // support lazy (solid-router) and component preload (react-router and tanstack-router)
    const lazy = r.lazy || r.component?.preload;

    // expect child routes to be on the children prop
    const children = Array.isArray(r.children) ? r.children : [];

    normalizedRoutes.push({
      path,
      lazy,
      children: children.length ? normalizeRoutes(children) : undefined,
    });
  }

  return normalizedRoutes;
};
