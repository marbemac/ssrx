import type { RouteInfo, RouterAdapter } from '@dete/vite/types';
import type { RouteDefinition } from '@solidjs/router';

export const solidRouterAdapter = () => {
  const adapter: RouterAdapter<RouteDefinition | RouteDefinition[]> = {
    normalizeExternalRoutes(externalRoutes, parentId): RouteInfo[] {
      const routes = Array.isArray(externalRoutes) ? externalRoutes : [externalRoutes];

      return routes.map((r, index) => {
        const id = parentId ? [parentId, index].join('-') : String(index);

        // @ts-expect-error added by solid-router
        const lazy = r.component?.preload;

        return {
          id,
          ...r,
          lazy,
          children: r.children ? adapter.normalizeExternalRoutes(r.children, id) : undefined,
        };
      });
    },
  };

  return adapter;
};
