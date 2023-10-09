import type { RouteInfo, RouterAdapter } from '@dete/vite/types';
import type { AnyRoute } from '@tanstack/router-core';

import { transformPath } from './transform-path.ts';

export const tanstackRouterAdapter = () => {
  const adapter: RouterAdapter<AnyRoute | AnyRoute[]> = {
    normalizeExternalRoutes(externalRoutes): RouteInfo[] {
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
          children: r.children ? adapter.normalizeExternalRoutes(r.children) : undefined,
        };
      });
    },
  };

  return adapter;
};
