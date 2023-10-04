import type { RouteObject as RRRouteObject } from 'react-router-dom';
import { matchRoutes } from 'react-router-dom';

import type { RouteInfo, RouterAdapter } from '../router.ts';

export const ReactRouterAdapter = () => {
  const adapter: RouterAdapter<RRRouteObject[]> = {
    getMatchedRoutes(url, routes) {
      const matches = matchRoutes(routes, url);
      if (!matches) return [];

      return matches.map(m => m.route);
    },

    normalizeExternalRoutes(routes, parentId): RouteInfo[] {
      return routes.map((r, index) => {
        const id = parentId ? [parentId, index].join('-') : String(index);

        return {
          id,
          ...r,
          children: r.children ? adapter.normalizeExternalRoutes(r.children, id) : undefined,
        };
      });
    },
  };

  return adapter;
};
