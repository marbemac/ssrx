/**
 * @remix-run/dev v2.2.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('node:path');
var router = require('@remix-run/router');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);

// Style collection logic adapted from solid-start: https://github.com/solidjs/solid-start

// Vite doesn't expose these so we just copy the list for now
// https://github.com/vitejs/vite/blob/d6bde8b03d433778aaed62afc2be0630c8131908/packages/vite/src/node/constants.ts#L49C23-L50
const cssFileRegExp = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
// https://github.com/vitejs/vite/blob/d6bde8b03d433778aaed62afc2be0630c8131908/packages/vite/src/node/plugins/css.ts#L160
const cssModulesRegExp = new RegExp(`\\.module${cssFileRegExp.source}`);
const isCssFile = file => cssFileRegExp.test(file);
const isCssModulesFile = file => cssModulesRegExp.test(file);
const getStylesForFiles = async (viteServer, cssModulesManifest, files) => {
  let styles = {};
  let deps = new Set();
  try {
    for (let file of files) {
      let normalizedPath = path__namespace.resolve(file).replace(/\\/g, "/");
      let node = await viteServer.moduleGraph.getModuleById(normalizedPath);
      if (!node) {
        let absolutePath = path__namespace.resolve(file);
        await viteServer.ssrLoadModule(absolutePath);
        node = await viteServer.moduleGraph.getModuleByUrl(absolutePath);
        if (!node) {
          console.log(`Could not resolve module for file: ${file}`);
          continue;
        }
      }
      await findDeps(viteServer, node, deps);
    }
  } catch (e) {
    console.error(e);
  }
  for (let dep of deps) {
    if (dep.file && isCssFile(dep.file) && !dep.url.endsWith("?url") // Ignore styles that resolved as URLs, otherwise we'll end up injecting URLs into the style tag contents
    ) {
      try {
        let css = isCssModulesFile(dep.file) ? cssModulesManifest[dep.file] : (await viteServer.ssrLoadModule(dep.url)).default;
        if (css === undefined) {
          throw new Error();
        }
        styles[dep.url] = css;
      } catch {
        console.warn(`Could not load ${dep.file}`);
        // this can happen with dynamically imported modules, I think
        // because the Vite module graph doesn't distinguish between
        // static and dynamic imports? TODO investigate, submit fix
      }
    }
  }

  return Object.entries(styles).map(([fileName, css], i) => [`\n/* ${fileName
  // Escape comment syntax in file paths
  .replace(/\/\*/g, "/\\*").replace(/\*\//g, "*\\/")} */`, css]).flat().join("\n") || undefined;
};
const findDeps = async (vite, node, deps) => {
  // since `ssrTransformResult.deps` contains URLs instead of `ModuleNode`s, this process is asynchronous.
  // instead of using `await`, we resolve all branches in parallel.
  let branches = [];
  async function addFromNode(node) {
    if (!deps.has(node)) {
      deps.add(node);
      await findDeps(vite, node, deps);
    }
  }
  async function addFromUrl(url) {
    let node = await vite.moduleGraph.getModuleByUrl(url);
    if (node) {
      await addFromNode(node);
    }
  }
  if (node.ssrTransformResult) {
    if (node.ssrTransformResult.deps) {
      node.ssrTransformResult.deps.forEach(url => branches.push(addFromUrl(url)));
    }
  } else {
    node.importedModules.forEach(node => branches.push(addFromNode(node)));
  }
  await Promise.all(branches);
};
const groupRoutesByParentId = manifest => {
  let routes = {};
  Object.values(manifest).forEach(route => {
    let parentId = route.parentId || "";
    if (!routes[parentId]) {
      routes[parentId] = [];
    }
    routes[parentId].push(route);
  });
  return routes;
};

// Create a map of routes by parentId to use recursively instead of
// repeatedly filtering the manifest.
const createRoutes = (manifest, parentId = "", routesByParentId = groupRoutesByParentId(manifest)) => {
  return (routesByParentId[parentId] || []).map(route => ({
    ...route,
    children: createRoutes(manifest, route.id, routesByParentId)
  }));
};
const getStylesForUrl = async (vite, config, cssModulesManifest, build, url) => {
  var _matchRoutes;
  if (url === undefined || url.includes("?_data=")) {
    return undefined;
  }
  let routes = createRoutes(build.routes);
  let appPath = path__namespace.relative(process.cwd(), config.appDirectory);
  let documentRouteFiles = ((_matchRoutes = router.matchRoutes(routes, url)) === null || _matchRoutes === void 0 ? void 0 : _matchRoutes.map(match => path__namespace.join(appPath, config.routes[match.route.id].file))) ?? [];
  let styles = await getStylesForFiles(vite, cssModulesManifest, documentRouteFiles);
  return styles;
};

exports.getStylesForUrl = getStylesForUrl;
exports.isCssModulesFile = isCssModulesFile;
