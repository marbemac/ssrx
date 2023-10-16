import type { RadixRouter } from 'radix3';
import { createRouter } from 'radix3';
import ssrManifest from 'virtual:super-ssr-manifest';

import type { AssetHtmlTag, SSRRouteManifest } from '../helpers/routes.ts';
import { assetsToTags } from '../helpers/routes.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type { AssetHtmlTag };

export const assetsForRequest = async (url: string) => {
  return import.meta.env.PROD ? prodAssetsForRequest(url) : devAssetsForRequest(url);
};

const devAssetsForRequest = async (url: string) => {
  // @ts-expect-error ignore
  const m = globalThis.MANIFEST as Manifest<any>;

  const tags: AssetHtmlTag[] = [];

  const pluginTags = await m.getVitePluginAssets(url);
  // @ts-expect-error ignore for now...
  tags.push(...pluginTags);

  const assets = await m.getAssets(url);
  tags.push(...assetsToTags(assets, { isDev: true, shouldModulePreload: true }));

  return tags;
};

const prodAssetsForRequest = (url: string) => {
  const u = new URL(url);

  const router = createManifestRouter();

  const entryAssets = ssrManifest.entry;
  const reqAssets = router.lookup(u.pathname) || { assets: [] };

  return assetsToTags([...entryAssets, ...reqAssets.assets], { isDev: false, shouldModulePreload: true });
};

type ExtractRecordValues<T extends Record<string, any>> = T[keyof T];

let routerSingleton: RadixRouter<ExtractRecordValues<SSRRouteManifest>>;

const createManifestRouter = () => {
  routerSingleton = routerSingleton || createRouter({ routes: ssrManifest.routes });
  return routerSingleton;
};
