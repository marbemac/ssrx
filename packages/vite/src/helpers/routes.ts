import type { ViteDevServer } from 'vite';

import type { RouteId, RouteInfo } from '../router.ts';

export type ViteClientManifest = {
  [path: string]: {
    assets: string[];
    css: string[];
    file: string;
    isEntry?: boolean;
    imports: string[];
    dynamicImports?: string[];
    isDynamicEntry?: boolean;
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
  isNested?: boolean;
  isPreload?: boolean;
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

type RouteIdToPaths = Record<RouteId, string[]>;

export type SSRManifest = {
  readonly entry: Readonly<SSREntryManifest>;
  readonly routes: Readonly<SSRRouteManifest>;
};

export type SSREntryManifest = Asset[];
export type SSRRouteManifest = Record<RouteId, { assets: Asset[] }>;

export const getRoutesIds = async (
  vite: ViteDevServer,
  routes: RouteInfo[],
  parentIds: string[] = [],
  parentPath?: string,
): Promise<RouteIdToPaths> => {
  const result: RouteIdToPaths = {};

  for (const route of routes) {
    const normalizedRouteId = normalizeRouteId(route.path);
    const isAbsolute = isAbsoluteRoute(route.path);
    let childParentIds = isAbsolute ? [] : parentIds;
    const routeId = (isAbsolute ? [normalizedRouteId] : [parentPath, normalizedRouteId]).filter(Boolean).join('/');

    if (route.lazy) {
      try {
        const resolvedRoute = await route.lazy();

        const id = await getModuleBySsrReference(vite, resolvedRoute);
        if (!id) throw new Error('Could not find reference');

        const mod = await vite.moduleGraph.getModuleById(id);

        childParentIds = [...parentIds, normalizeRouteId(mod!.url)!];
        result[`/${routeId}`] = childParentIds;
      } catch (e) {
        console.error('Failed to load route:', route.path, e);
      }
    }

    if (route.children) {
      Object.assign(result, await getRoutesIds(vite, route.children, childParentIds, routeId));
    }
  }

  return result;
};

export const emptySSRManifest: SSRManifest = {
  entry: [],
  routes: {},
};

export const generateSSRManifest = (clientManifest: ViteClientManifest, routeIds: RouteIdToPaths) => {
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

export const generateRoutesManifest = (clientManifest: ViteClientManifest, routeIds: RouteIdToPaths) => {
  const result: SSRRouteManifest = {};

  // accumulate route assets
  for (const [routeId, routePaths] of Object.entries(routeIds)) {
    const assets: Asset[] = [];

    const usedAssets = new Set<string>();

    for (const routePath of routePaths) {
      const routeMeta = clientManifest[routePath];
      if (!routeMeta) continue;

      assets.push(
        ...Object.values(
          getManifestModuleAssets(clientManifest, routeMeta, usedAssets, false, {
            skipEntry: true,
            includeDynamic: true,
          }),
        ),
      );
    }

    if (assets.length) {
      result[routeId] = { assets: sortAssets(assets) };
    }
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
                href: url,
              },
            };
          } else {
            return {
              tag: 'script',
              injectTo: 'body' as const,
              attrs: {
                defer: true,
                type: 'module',
                src: url,
              },
            };
          }
      }

      return null;
    })
    .filter(Boolean) as AssetHtmlTag[];
};

export const sortAssets = (assets: Asset[]): Asset[] => {
  return assets.sort((a, b) =>
    a.weight === b.weight ? Number(a.isNested || false) - Number(b.isNested || false) : a.weight - b.weight,
  );
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

export const buildAssetUrl = (assetPath: string, basePath?: string) => {
  // strip leading and trailing slashes
  const bp = basePath ? basePath.replace(/^\/+|\/+$/g, '') : '';
  if (!bp) return assetPath;

  // strip leading and trailing slashes
  const ap = assetPath.replace(/^\/+|\/+$/g, '');

  return `/${bp}/${ap}`;
};

/**
 * --------------
 * Internal below
 * --------------
 */

const isAbsoluteRoute = (routePath?: string) => {
  if (!routePath) return false;

  return routePath.startsWith('/') ? true : false;
};

const normalizeRouteId = (routePath?: string) => {
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
  usedAssets: Set<string> = new Set(),
  isNested?: boolean,
  opts?: {
    skipEntry?: boolean;
    includeDynamic?: boolean;
  },
): Record<string, Asset> => {
  if (module.isEntry && opts?.skipEntry) return {};

  const rootAssets = [...(module?.assets ?? []), ...(module?.css ?? []), module?.file];

  const assets = rootAssets.reduce((res, asset) => {
    if (asset) {
      const type = getAssetType(asset);
      const isEntry = module.isEntry && module.file === asset;
      const isDynamic = module.isDynamicEntry && module.file === asset;
      const entryIdentifier = `${type}:${asset}`;

      // only keep asset files, no dupes
      if (type && !usedAssets.has(entryIdentifier) && (!isEntry || !opts?.skipEntry)) {
        usedAssets.add(entryIdentifier);

        const weight = isEntry ? 1.9 : getAssetWeight(asset);
        const nestedWeight = isNested ? 0.1 : 0;
        const dynamicWeight = isDynamic ? 0.1 : 0;

        res[asset] = {
          url: `/${asset}`,
          weight: weight + nestedWeight + dynamicWeight,
          type,
          isNested,
          isPreload: !isEntry ? true : undefined,
        };
      }
    }

    return res;
  }, {} as Record<string, Asset>);

  const nestedAssets = [...(module?.imports ?? [])];
  if (opts?.includeDynamic && module?.dynamicImports) {
    nestedAssets.push(...module.dynamicImports);
  }

  if (nestedAssets.length) {
    nestedAssets.forEach(nestedAsset => {
      const nestedModule = manifest[nestedAsset];

      if (nestedModule) {
        Object.assign(assets, getManifestModuleAssets(manifest, nestedModule, usedAssets, true, opts));
      }
    });
  }

  return assets;
};

const getModuleBySsrReference = async (vite: ViteDevServer, mod: unknown) => {
  for (const [id, value] of vite.moduleGraph.idToModuleMap.entries()) {
    if (!value.ssrModule) {
      await vite.ssrLoadModule(id);
    }

    if (value.ssrModule === mod) return id;
  }

  return null;
};
