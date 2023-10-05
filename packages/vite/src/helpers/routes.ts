import type { ViteDevServer } from 'vite';

import type { MatchedRoute, RouteId, RouteInfo } from '../router.ts';
import { getModuleBySsrReference } from './get-module-by-ssr-reference.ts';

export type ViteClientManifest = {
  [path: string]: {
    assets: string[];
    css: string[];
    file: string;
    isEntry?: boolean;
    imports: string[];
  };
};

export enum AssetType {
  style = 'style',
  script = 'script',
  image = 'image',
  font = 'font',
}

export type Asset = {
  type: AssetType;
  url: string;
  weight: number;
  isNested: boolean;
  isPreload: boolean;
  content?: string;
};

/**
 * Subset of Vite's HtmlTagDescriptor type
 */
export type AssetHtmlTag = {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string;

  /**
   * @default 'head-prepend'
   */
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
};

type RouteIdToPath = Record<RouteId, string>;

export type SSRManifest = {
  readonly entry: Readonly<SSREntryManifest>;
  readonly routes: Readonly<SSRRouteManifest>;
};

export type SSREntryManifest = Asset[];
export type SSRRouteManifest = Record<RouteId, Asset[]>;

export const getRoutesIds = async (
  vite: ViteDevServer,
  routes: RouteInfo[],
  index?: string,
): Promise<RouteIdToPath> => {
  const result: RouteIdToPath = {};

  for (const routeIndex in routes) {
    const route = routes[routeIndex]!;
    const routeId = [index, routeIndex].filter(Boolean).join('-');

    if (route.lazy) {
      try {
        const resolvedRoute = await route.lazy();

        const id = await getModuleBySsrReference(vite, resolvedRoute);
        if (!id) throw new Error('Could not find reference');

        const mod = await vite.moduleGraph.getModuleById(id);

        result[routeId] = normalizeRouteId(mod!.url);
      } catch (e) {
        console.error('Failed to load route:', route.path, e);
      }
    }

    if (route.children) {
      Object.assign(result, await getRoutesIds(vite, route.children, routeId));
    }
  }

  return result;
};

export const emptySSRManifest: SSRManifest = {
  entry: [],
  routes: {},
};

export const generateSSRManifest = (clientManifest: ViteClientManifest, routeIds: RouteIdToPath) => {
  return {
    entry: generateEntryManifest(clientManifest),
    routes: generateRoutesManifest(clientManifest, routeIds),
  };
};

export const generateEntryManifest = (clientManifest: ViteClientManifest) => {
  const entry = Object.values(clientManifest).find(m => m.isEntry);
  if (!entry) {
    throw new Error('Could not find a main entry in the client manifest');
  }

  return sortAssets(Object.values(getManifestModuleAssets(clientManifest, entry)));
};

export const generateRoutesManifest = (clientManifest: ViteClientManifest, routeIds: RouteIdToPath) => {
  const result: SSRRouteManifest = {};

  // accumulate route assets
  for (const [routeId, routePath] of Object.entries(routeIds)) {
    const routeMeta = clientManifest[routePath];
    if (!routeMeta) continue;

    result[routeId] = sortAssets(Object.values(getManifestModuleAssets(clientManifest, routeMeta)));
  }

  return result;
};

export const assetsToHtml = (assets: Asset[], opts?: { isDev?: boolean; shouldModulePreload?: boolean }) => {
  const tags = assetsToTags(assets, opts);

  return tags.map(({ tag, attrs, children }) => {
    const attrsString = Object.entries(attrs ?? {})
      .map(([key, value]) => {
        if (value === true) return key;
        if (value === false) return null;
        return `${key}="${value}"`;
      })
      .filter(Boolean)
      .join(' ');

    return `<${tag} ${attrsString}>${children || ''}</${tag}>`;
  });
};

export const assetsToTags = (
  assets: Asset[],
  opts?: { isDev?: boolean; shouldModulePreload?: boolean },
): AssetHtmlTag[] => {
  const isDev = opts?.isDev ?? false;
  const shouldModulePreload = opts?.shouldModulePreload ?? true;

  return assets
    .map(({ type, url, isPreload, content = '' }) => {
      switch (type) {
        case 'style':
          if (isDev) {
            return {
              tag: 'style',
              attrs: {
                'data-vite-dev-id': url,
              },
              children: content,
            };
          } else {
            return {
              tag: 'link',
              attrs: {
                rel: 'stylesheet',
                href: url,
              },
            };
          }

        case 'script':
          if (isPreload && !shouldModulePreload) return null;

          if (isPreload) {
            return {
              tag: 'link',
              attrs: {
                rel: 'modulepreload',
                as: 'script',
                crossorigin: true,
                href: url,
              },
            };
          } else {
            return {
              tag: 'script',
              attrs: {
                async: true,
                type: 'module',
                crossorigin: true,
                src: url,
              },
            };
          }
      }

      return null;
    })
    .filter(Boolean);
};

export const getRouteAssets = (manifest: SSRManifest, matches: MatchedRoute[]) => {
  // always include the entry assets
  const assets = [...manifest.entry];

  for (const m of matches) {
    const routeAssets = manifest.routes[m.__id];

    if (routeAssets?.length) {
      assets.push(...routeAssets);
    }
  }

  return sortAssets(assets);
};

export const sortAssets = (assets: Asset[]): Asset[] => {
  return assets.sort((a, b) => (a.weight === b.weight ? Number(a.isNested) - Number(b.isNested) : a.weight - b.weight));
};

export const getAssetWeight = (asset: string): number => {
  const type = getAssetType(asset);

  switch (type) {
    case 'style':
      return 1;

    case 'script':
      return 2;

    default:
      return 3;
  }
};

/**
 * --------------
 * Internal below
 * --------------
 */

const normalizeRouteId = (routePath: string) => {
  if (!routePath) return routePath;

  // remove leading/trailing slashes
  return routePath.replace(/^\/|\/$/g, '');
};

const getAssetType = (asset: string): AssetType | null => {
  const ext = asset.split('.').at(-1)?.toLowerCase();

  switch (ext) {
    case 'css':
    case 'scss':
      return AssetType.style;

    case 'js':
      return AssetType.script;

    case 'svg':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'gif':
    case 'ico':
      return AssetType.image;

    case 'ttf':
    case 'otf':
    case 'woff':
    case 'woff2':
      return AssetType.font;

    default:
      return null;
  }
};

const getManifestModuleAssets = (
  manifest: ViteClientManifest,
  module: ViteClientManifest[string],
  isNested = false,
): Record<string, Asset> => {
  const rootAssets = [...(module?.assets ?? []), ...(module?.css ?? []), module?.file];

  const assets = rootAssets.reduce((res, asset) => {
    if (asset) {
      const type = getAssetType(asset);
      const isEntry = module.isEntry && module.file === asset;

      // only keep asset files
      if (type) {
        res[asset] = {
          url: `/${asset}`,
          weight: isEntry ? 1.9 : getAssetWeight(asset),
          type,
          isNested,
          isPreload: !isEntry,
        };
      }
    }

    return res;
  }, {} as Record<string, Asset>);

  // nested assets
  if (module?.imports?.length) {
    module.imports.forEach(nestedAsset => {
      const nestedModule = manifest[nestedAsset];

      if (nestedModule) {
        Object.assign(assets, getManifestModuleAssets(manifest, nestedModule, true));
      }
    });
  }

  return assets;
};
