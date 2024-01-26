import type { RadixRouter } from 'radix3';
import { createRouter } from 'radix3';
import ssrManifest from 'virtual:ssrx-manifest';

import { mergeScriptTags } from '../helpers/html.ts';
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

  const finalTags = tags.filter(t => t.tag !== 'script');

  const scriptTags = tags.filter(t => t.tag === 'script');
  const mergedScriptTag = mergeScriptTags(scriptTags);
  if (mergedScriptTag) {
    finalTags.push(mergedScriptTag);
  }

  return groupAssets(finalTags);
};

const prodAssetsForRequest = (url: string) => {
  const u = new URL(url);

  const router = createManifestRouter();

  const entryAssets = ssrManifest.entry;
  const reqAssets = router.lookup(u.pathname) ?? { assets: [] };

  const finalTags = assetsToTags([...entryAssets, ...reqAssets.assets], { isDev: false, shouldModulePreload: true });

  return groupAssets(finalTags);
};

type ExtractRecordValues<T extends Record<string, any>> = T[keyof T];

let routerSingleton: RadixRouter<ExtractRecordValues<SSRRouteManifest>>;

const createManifestRouter = () => {
  routerSingleton = routerSingleton || createRouter({ routes: ssrManifest.routes });
  return routerSingleton;
};

const groupAssets = (assets: AssetHtmlTag[]) => ({
  headAssets: assets.filter(a => a.injectTo !== 'body'),
  bodyAssets: assets.filter(a => a.injectTo === 'body'),
});
