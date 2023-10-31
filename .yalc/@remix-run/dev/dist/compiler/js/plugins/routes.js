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
var routeExports = require('../../utils/routeExports.js');
var invariant = require('../../../invariant.js');

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

// If you change this, make sure you update loadRouteModuleWithBlockingLinks in
// remix-react/routes.ts
const browserSafeRouteExports = {
  ErrorBoundary: true,
  default: true,
  handle: true,
  links: true,
  meta: true,
  shouldRevalidate: true
};

/**
 * This plugin loads route modules for the browser build, using module shims
 * that re-export only the route module exports that are safe for the browser.
 */
function browserRouteModulesPlugin({
  config,
  fileWatchCache
}, suffixMatcher) {
  return {
    name: "browser-route-modules",
    async setup(build) {
      let routesByFile = Object.keys(config.routes).reduce((map, key) => {
        let route = config.routes[key];
        map.set(route.file, route);
        return map;
      }, new Map());
      build.onResolve({
        filter: suffixMatcher
      }, args => {
        return {
          path: args.path,
          namespace: "browser-route-module"
        };
      });
      build.onLoad({
        filter: suffixMatcher,
        namespace: "browser-route-module"
      }, async args => {
        let theExports;
        let file = args.path.replace(suffixMatcher, "");
        let route = routesByFile.get(file);
        try {
          invariant["default"](route, `Cannot get route by path: ${args.path}`);
          let cacheKey = `module-exports:${route.id}`;
          let {
            cacheValue: sourceExports
          } = await fileWatchCache.getOrSet(cacheKey, async () => {
            let file = path__namespace.resolve(config.appDirectory, config.routes[route.id].file);
            return {
              cacheValue: await routeExports.getRouteModuleExports(config, route.id),
              fileDependencies: new Set([file])
            };
          });
          theExports = sourceExports.filter(ex => !!browserSafeRouteExports[ex]);
        } catch (error) {
          return {
            errors: [{
              text: error.message,
              pluginName: "browser-route-module"
            }]
          };
        }
        let contents = "module.exports = {};";
        if (theExports.length !== 0) {
          let spec = `{ ${theExports.join(", ")} }`;
          contents = `export ${spec} from ${JSON.stringify(`./${file}`)};`;
        }
        return {
          contents,
          resolveDir: config.appDirectory,
          loader: "js"
        };
      });
    }
  };
}

exports.browserRouteModulesPlugin = browserRouteModulesPlugin;
