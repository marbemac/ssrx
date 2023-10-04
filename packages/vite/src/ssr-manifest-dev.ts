/*!
 * Portions of this code are originally from Vinxi
 *
 * Credits to nksaraf:
 * https://github.com/nksaraf/vinxi
 */

import { isBuiltin } from 'node:module';

import * as path from 'path';
import type { ModuleNode, ViteDevServer } from 'vite';

import { type Asset, AssetType, getAssetWeight } from './helpers/routes.ts';

// Vite doesn't expose this
// https://github.com/vitejs/vite/blob/3edd1af56e980aef56641a5a51cf2932bb580d41/packages/vite/src/node/plugins/css.ts#L96
const STYLE_ASSET_REGEX = /\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/;

export async function findStylesInModuleGraph(vite: ViteDevServer, match: string[], ssr: boolean) {
  const assets: { [id: string]: Asset } = {};

  const dependencies = await findDependencies(vite, match, ssr);

  for (const dep of dependencies) {
    const { file, url } = dep;

    if (file && STYLE_ASSET_REGEX.test(file)) {
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
    const node = await getViteModuleNode(vite, url, ssr);

    if (node) {
      await add(node);
    }
  }

  if (node.url.endsWith('.css')) {
    return;
  }

  if (ssr && node.ssrTransformResult) {
    if (node.ssrTransformResult.deps) {
      node.ssrTransformResult.deps.forEach(url => branches.push(add_by_url(url, ssr)));
    }

    // if (node.ssrTransformResult.dynamicDeps) {
    //   node.ssrTransformResult.dynamicDeps.forEach(url => branches.push(add_by_url(url)));
    // }
  } else if (!ssr) {
    node.importedModules.forEach(node => branches.push(add_by_url(node.url, ssr)));
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
