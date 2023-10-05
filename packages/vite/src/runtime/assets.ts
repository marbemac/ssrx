import type { RadixRouter } from 'radix3';
import { createRouter } from 'radix3';
import ssrManifest from 'virtual:dete-ssr-manifest';

import type { AssetHtmlTag } from '../helpers/routes.ts';
import { type Asset, assetsToTags } from '../helpers/routes.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type { AssetHtmlTag };

export const assetsForRequest = async (url: string) => {
  const assets = import.meta.env.PROD ? prodAssetsForRequest(url) : await devAssetsForRequest(url);
  const htmlTags = assetsToTags(assets, { isDev: import.meta.env.DEV, shouldModulePreload: true });

  return htmlTags;
};

const devAssetsForRequest = async (url: string) => {
  // @ts-expect-error ignore
  const m = globalThis.MANIFEST as Manifest<any>;

  return m.getAssets(url);
};

const prodAssetsForRequest = (url: string) => {
  const u = new URL(url);

  const router = createManifestRouter();

  const entryAssets = ssrManifest.entry;
  const reqAssets = router.lookup(u.pathname) || [];

  return [...entryAssets, ...reqAssets];
};

let routerSingleton: RadixRouter<Asset[]>;

const createManifestRouter = () => {
  routerSingleton = routerSingleton || createRouter({ routes: ssrManifest.routes });
  return routerSingleton;
};
