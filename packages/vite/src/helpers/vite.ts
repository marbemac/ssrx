/*!
 * Portions of this code are originally from Vinxi
 *
 * Credits to nksaraf:
 * https://github.com/nksaraf/vinxi
 */

import { isBuiltin } from 'node:module';

import * as path from 'path';
import type { ModuleNode, ViteDevServer } from 'vite';

import { type Asset, AssetType, getAssetWeight } from './routes.ts';

export async function findStylesInModuleGraph(vite: ViteDevServer, match: string[], ssr: boolean) {
  const assets: { [id: string]: Asset } = {};

  const dependencies = await findDependencies(vite, match, ssr);

  for (const dep of dependencies) {
    const { file, url } = dep;

    if (file && ASSET_REGEXES.styles.test(file)) {
      try {
        const mod = await vite.ssrLoadModule(url);

        const code = mod['default'];

        assets[file] = {
          type: AssetType.style,
          url: path.join(vite.config.root, dep.url),
          weight: getAssetWeight(file),
          content: code,
          isNested: false,
          isPreload: false,
        };
      } catch {
        // this can happen with dynamically imported modules, I think
        // because the Vite module graph doesn't distinguish between
        // static and dynamic imports? TODO investigate, submit fix
      }
    }
  }

  return assets;
}

async function getViteModuleNode(vite: ViteDevServer, file: string, ssr: boolean) {
  if (file.startsWith('node:') || isBuiltin(file)) {
    return null;
  }

  const resolvedId = await vite.pluginContainer.resolveId(file, undefined, {
    ssr: ssr,
  });

  if (!resolvedId) {
    console.log('not found');
    return;
  }

  const id = resolvedId.id;

  const normalizedPath = path.resolve(id);

  try {
    let node = await vite.moduleGraph.getModuleById(normalizedPath);

    if (!node) {
      node = await vite.moduleGraph.getModuleByUrl(normalizedPath);
      if (!node) {
        if (ssr) {
          await vite.moduleGraph.ensureEntryFromUrl(normalizedPath, ssr);
          node = await vite.moduleGraph.getModuleById(normalizedPath);
        } else {
          await vite.moduleGraph.ensureEntryFromUrl(normalizedPath);
          node = await vite.moduleGraph.getModuleById(normalizedPath);
        }
      }

      if (!node?.transformResult && !ssr) {
        await vite.transformRequest(normalizedPath);
      }

      if (ssr && !node?.ssrTransformResult) {
        await vite.ssrLoadModule(file);
        node = await vite.moduleGraph.getModuleById(normalizedPath);
      }
    } else {
      if (!node?.transformResult && !ssr) {
        await vite.transformRequest(normalizedPath);
      }

      if (ssr && !node?.ssrTransformResult) {
        await vite.ssrLoadModule(normalizedPath);
        node = await vite.moduleGraph.getModuleById(normalizedPath);
      }
    }

    return node;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function findDeps(vite: ViteDevServer, node: ModuleNode, deps: Set<ModuleNode>, ssr: boolean) {
  // since `ssrTransformResult.deps` contains URLs instead of `ModuleNode`s, this process is asynchronous.
  // instead of using `await`, we resolve all branches in parallel.
  const branches: Promise<void>[] = [];

  async function add(node: ModuleNode) {
    if (!deps.has(node)) {
      deps.add(node);
      await findDeps(vite, node, deps, ssr);
    }
  }

  async function add_by_url(url: string, ssr: boolean) {
    if (!isInternalRuntimeAsset(url)) return;

    const node = await getViteModuleNode(vite, url, ssr);

    if (node) {
      await add(node);
    }
  }

  if (ASSET_REGEXES.styles.test(node.url)) {
    return;
  }

  if (ssr && node.ssrTransformResult) {
    if (node.ssrTransformResult.deps) {
      node.ssrTransformResult.deps.forEach(url => {
        branches.push(add_by_url(url, ssr));
      });
    }

    // if (node.ssrTransformResult.dynamicDeps) {
    //   node.ssrTransformResult.dynamicDeps.forEach(url => branches.push(add_by_url(url)));
    // }
  } else if (!ssr) {
    node.clientImportedModules.forEach(child => {
      branches.push(add_by_url(child.url, ssr));
    });
  }

  await Promise.all(branches);
}

async function findDependencies(vite: ViteDevServer, match: string[], ssr: boolean) {
  const deps = new Set<ModuleNode>();

  try {
    for (const file of match) {
      const node = await getViteModuleNode(vite, file, ssr);
      if (node) {
        await findDeps(vite, node, deps, ssr);
      }
    }
  } catch (e) {
    console.error(e);
  }

  return deps;
}

const ASSET_REGEXES = {
  styles: /\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/,
  external: /\\node_modules\/.*|\\inc\/.*/,
  static: /\.(txt|ico|svg|webp|png|jpg|jpeg|gif|mp3)$/,
  runtime: /\.(js|ts|tsx|jsx)$/,

  // Vite plugins generally use `/@xyz/...` as the prefix for their assets
  // SOME vite plugins, however, use a nul character \0, for example this one:
  // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/dynamicImportVars.ts#L22
  vite: /^\/@.+|^\0vite\/.+/,
};

export const isInternalRuntimeAsset = (assetPath: string) => {
  return (
    (ASSET_REGEXES.runtime.test(assetPath) || ASSET_REGEXES.styles.test(assetPath)) &&
    !ASSET_REGEXES.vite.test(assetPath) &&
    !ASSET_REGEXES.external.test(assetPath)
  );
};

export const isAssetHandledByVite = (assetPath: string, basePath?: string) => {
  const [reqPath, reqSearch] = assetPath.split('?');

  /**
   * Vite adds ?import to dynamic imports - we can use this to identify that requests such as:
   *
   * const { default: albums } = await import('../data/albums.json');
   *
   * should be handled by the vite server.
   */
  if (reqSearch === 'import') {
    return true;
  }

  const pathname = trimBasePath(reqPath, basePath);
  if (!pathname) return false;

  return (
    ASSET_REGEXES.external.test(pathname) ||
    ASSET_REGEXES.runtime.test(pathname) ||
    ASSET_REGEXES.vite.test(pathname) ||
    ASSET_REGEXES.styles.test(pathname) ||
    ASSET_REGEXES.static.test(pathname)
  );
};

const trimBasePath = (reqPath?: string, basePath?: string) => {
  if (!reqPath) return reqPath;

  if (basePath) {
    if (reqPath.startsWith(basePath)) {
      return reqPath.substring(basePath.length);
    }
  }
  return reqPath;
};
