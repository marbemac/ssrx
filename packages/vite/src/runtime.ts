import routes from 'virtual:dete-routes';
import ssrManifest from 'virtual:dete-ssr-manifest';

import { assetsToHtml, getRouteAssets } from './helpers/routes.ts';
import type { RouterAdapter } from './router.ts';
import type { Manifest } from './ssr-manifest';

export const prepareManifest = <R>(adapter: Pick<RouterAdapter<R>, 'getMatchedRoutes'>) => {
  // const normalizedRoutes = adapter.normalizeExternalRoutes(routes);

  const devAssetsForRequest = async (url: string) => {
    // @ts-expect-error ignore
    const m = globalThis.MANIFEST as Manifest<any>;

    return m.getAssetsHtml(url);
  };

  const prodAssetsForRequest = (url: string) => {
    const u = new URL(url);
    const matches = adapter.getMatchedRoutes(u.pathname, routes);
    const assets = getRouteAssets(ssrManifest, matches);

    return assetsToHtml(assets, {
      isDev: false,
      shouldModulePreload: true,
    });
  };

  return {
    assetsForRequest: async (url: string) => {
      if (import.meta.env.DEV) {
        return devAssetsForRequest(url);
      }

      return prodAssetsForRequest(url);
    },
  };
};
