import type { RouteInfo, RouterAdapter } from '@dete/vite/types';
import type { RouteObject as RRRouteObject } from 'react-router-dom';

export const reactRouterAdapter = () => {
  const adapter: RouterAdapter<RRRouteObject[]> = {
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
