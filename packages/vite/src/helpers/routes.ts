import type { ModuleNode, ViteDevServer } from 'vite';

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
   * @default 'head'
   */
  injectTo?: 'head' | 'body';
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
      let mod: ModuleNode | undefined;

      // first try lookup by reference
      try {
        const resolvedRoute = await route.lazy();

        const id = await getModuleBySsrReference(vite, resolvedRoute);
        if (!id) throw new Error('Could not find reference');

        mod = await vite.moduleGraph.getModuleById(id);
      } catch {
        // noop
      }

      // second attempt to lookup by import path on the fn string
      // this can happen if the route lazy fn does not return the dynamic import a dynamic import (e.g. `() => import('./foo').then((r) => r.Component)`)
      if (!mod) {
        try {
          const importPath = route.lazy.toString().split('dynamic_import__("')[1]?.split('")')[0];
          if (importPath) {
            const resolvedId = await vite.pluginContainer.resolveId(importPath, undefined, {
              ssr: true,
            });

            if (resolvedId?.id) {
              mod = await vite.moduleGraph.getModuleById(resolvedId?.id);
            }
          }
        } catch {
          // noop
        }
      }

      if (mod) {
        childParentIds = [...parentIds, normalizeRouteId(mod!.url)!];
        result[`/${routeId}`] = childParentIds;
      } else {
        console.error(`Failed to load lazy route, could not locate module '${route.path}'`);
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
  const entry = generateEntryManifest(clientManifest);
  const entryUrls = entry.map(e => e.url.replace(/^\//, ''));

  return {
    entry,
    routes: generateRoutesManifest(clientManifest, routeIds, entryUrls),
  };
};

export const generateEntryManifest = (clientManifest: ViteClientManifest) => {
  const entry = Object.values(clientManifest).find(m => m.isEntry);
  if (!entry) {
    throw new Error('Could not find a main entry in the client manifest');
  }

  return sortAssets(Object.values(getManifestModuleAssets({ manifest: clientManifest, module: entry })));
};

export const generateRoutesManifest = (
  clientManifest: ViteClientManifest,
  routeIds: RouteIdToPaths,
  ignoreAssetUrls?: string[],
) => {
  const result: SSRRouteManifest = {};

  // accumulate route assets
  for (const [routeId, routePaths] of Object.entries(routeIds)) {
    const assets: Asset[] = [];

    for (const routePath of routePaths) {
      const routeMeta = clientManifest[routePath];
      if (!routeMeta) continue;

      assets.push(
        ...Object.values(
          getManifestModuleAssets({
            manifest: clientManifest,
            module: routeMeta,
            usedAssets: new Set<string>(ignoreAssetUrls),
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

  const tags: AssetHtmlTag[] = [];

  for (const asset of assets) {
    const { type, url, isPreload, content = '', isNested } = asset;

    if (type === 'style') {
      if (isDev) {
        tags.push({
          tag: 'style',
          attrs: {
            'data-vite-dev-id': url,
          },
          children: content,
        });
      } else {
        // preload critical entry chunks so that providers like Cloudflare can
        // add early hints
        if (!isNested) {
          tags.push({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'style',
              href: url,
            },
          });
        }

        tags.push({
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: url,
          },
        });
      }
    } else if (type === 'script') {
      if (isPreload && !shouldModulePreload) continue;

      if (isPreload) {
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'modulepreload',
            as: 'script',
            href: url,
          },
        });
      } else {
        tags.push({
          tag: 'script',
          injectTo: 'body' as const,
          attrs: {
            async: true,
            type: 'module',
            src: url,
          },
        });
      }
    }
  }

  return tags;
};

export const sortAssets = (assets: Asset[]): Asset[] => {
  // remove duplicates
  const assetMap = assets.reduce((res, asset) => {
    res[asset.url] = asset;
    return res;
  }, {} as Record<string, Asset>);

  // sort
  return Object.values(assetMap).sort((a, b) =>
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
  const ap = assetPath.replace(/^\/+|\/+$/g, '');
  const bp = basePath ? basePath.replace(/^\/+|\/+$/g, '') : '';

  return `/${[bp, ap].filter(Boolean).join('/')}`;
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

const getManifestModuleAssets = ({
  manifest,
  module,
  usedAssets = new Set(),
  isNested = false,
  skipEntry,
  includeDynamic,
}: {
  manifest: ViteClientManifest;
  module: ViteClientManifest[string];
  usedAssets?: Set<string>;
  isNested?: boolean;
  skipEntry?: boolean;
  includeDynamic?: boolean;
}): Record<string, Asset> => {
  if (module.isEntry && skipEntry) return {};

  const rootAssets = [...(module?.assets ?? []), ...(module?.css ?? []), module?.file];

  const assets = rootAssets.reduce((res, asset) => {
    if (asset) {
      const type = getAssetType(asset);
      const isEntry = module.isEntry && module.file === asset;
      const isDynamic = module.isDynamicEntry && module.file === asset;

      // only keep asset files, no dupes
      if (type && !usedAssets.has(asset) && (!isEntry || !skipEntry)) {
        usedAssets.add(asset);

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
  if (includeDynamic && module?.dynamicImports) {
    nestedAssets.push(...module.dynamicImports);
  }

  if (nestedAssets.length) {
    for (const nestedAsset of nestedAssets) {
      const nestedModule = manifest[nestedAsset];

      if (nestedModule) {
        // detect circulars and certain classes of dupes
        const file = nestedModule.file;
        if (file) {
          if (usedAssets.has(file)) {
            continue;
          }
        }

        Object.assign(
          assets,
          getManifestModuleAssets({
            manifest,
            module: nestedModule,
            usedAssets,
            isNested: true,
            includeDynamic,
            skipEntry,
          }),
        );
      }
    }
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
