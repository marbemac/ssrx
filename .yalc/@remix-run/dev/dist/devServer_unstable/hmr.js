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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

// route id: filepaths relative to app/ dir without extension
// filename: absolute or relative to root for things we don't handle
// for things we handle: relative to app dir
let updates = (config, manifest, prevManifest, hdr, prevHdr) => {
  let updates = [];
  for (let [routeId, route] of Object.entries(manifest.routes)) {
    var _prevRoute$imports;
    let prevRoute = prevManifest.routes[routeId];
    let file = config.routes[routeId].file;
    let moduleId = path__default["default"].relative(config.rootDirectory, path__default["default"].join(config.appDirectory, file));

    // new route
    if (!prevRoute) {
      updates.push({
        id: moduleId,
        routeId: route.id,
        url: route.module,
        revalidate: true,
        reason: "Route added"
      });
      continue;
    }

    // when loaders are diff
    let loaderHash = hdr[file];
    let prevLoaderHash = prevHdr === null || prevHdr === void 0 ? void 0 : prevHdr[file];
    if (loaderHash !== prevLoaderHash) {
      updates.push({
        id: moduleId,
        routeId: route.id,
        url: route.module,
        revalidate: true,
        reason: "Loader changed"
      });
      continue;
    }

    // when fingerprinted assets are diff (self or imports)
    let diffModule = route.module !== prevRoute.module;
    let xorImports = new Set(route.imports ?? []);
    (_prevRoute$imports = prevRoute.imports) === null || _prevRoute$imports === void 0 ? void 0 : _prevRoute$imports.forEach(xorImports.delete.bind(xorImports));
    if (diffModule || xorImports.size > 0) {
      updates.push({
        id: moduleId,
        routeId: route.id,
        url: route.module,
        revalidate: false,
        reason: "Component changed"
      });
      continue;
    }
  }
  return updates;
};

exports.updates = updates;
