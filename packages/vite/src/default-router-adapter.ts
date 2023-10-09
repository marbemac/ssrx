import type { RouteInfo, RouterAdapter } from './types.ts';

/**
 * A default router adapter that covers common patterns.
 *
 * Expects route paths to be defined in a format that conforms to expectations of https://github.com/unjs/radix3.
 */
export const defaultRouterAdapter = () => {
  const adapter: RouterAdapter<unknown> = {
    normalizeExternalRoutes(routeFile) {
      if (!routeFile || typeof routeFile !== 'object') {
        console.warn('Could not read route file');
        return [];
      }

      // @ts-expect-error expect routes to be exported on the routes prop by default
      const routes = routeFile.routes;

      return normalizeRoutes(routes);
    },
  };

  return adapter;
};

const normalizeRoutes = (externalRoutes: unknown): RouteInfo[] => {
  const routes = Array.isArray(externalRoutes) ? externalRoutes : [externalRoutes];

  const normalizedRoutes: RouteInfo[] = [];

  for (const r of routes) {
    if (!r || typeof r !== 'object') continue;

    // @ts-expect-error grab path from path property without transformation (so must conform to expectations of https://github.com/unjs/radix3)
    const path = r.path;

    // @ts-expect-error support lazy (solid-router) and component preload (react-router and tanstack-router)
    const lazy = r.lazy || r.component?.preload;

    // @ts-expect-error expect child routes to be on the children prop
    const children = Array.isArray(r.children) ? r.children : [];

    normalizedRoutes.push({
      path,
      lazy,
      children: children.length ? normalizeRoutes(children) : undefined,
    });
  }

  return normalizedRoutes;
};
