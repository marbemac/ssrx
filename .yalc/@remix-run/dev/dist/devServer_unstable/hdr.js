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
var esbuild = require('esbuild');
var emptyModules = require('../compiler/plugins/emptyModules.js');
var external = require('../compiler/plugins/external.js');
var routeExports = require('../compiler/utils/routeExports.js');
var tsconfig = require('../compiler/utils/tsconfig.js');
var invariant = require('../invariant.js');
var mdx = require('../compiler/plugins/mdx.js');
var loaders = require('../compiler/utils/loaders.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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
var esbuild__default = /*#__PURE__*/_interopDefaultLegacy(esbuild);

function isBareModuleId(id) {
  return !id.startsWith("node:") && !id.startsWith(".") && !path__namespace.isAbsolute(id);
}
let detectLoaderChanges = async ctx => {
  let entryPoints = {};
  for (let id of Object.keys(ctx.config.routes)) {
    entryPoints[id] = ctx.config.routes[id].file + "?loader";
  }
  let options = {
    bundle: true,
    entryPoints: entryPoints,
    treeShaking: true,
    metafile: true,
    outdir: ".",
    write: false,
    entryNames: "[hash]",
    loader: loaders.loaders,
    logLevel: "silent",
    plugins: [{
      name: "hmr-loader",
      setup(build) {
        let routesByFile = Object.keys(ctx.config.routes).reduce((map, key) => {
          let route = ctx.config.routes[key];
          map.set(route.file, route);
          return map;
        }, new Map());
        let filter = /\?loader$/;
        build.onResolve({
          filter
        }, args => {
          return {
            path: args.path,
            namespace: "hmr-loader"
          };
        });
        build.onLoad({
          filter,
          namespace: "hmr-loader"
        }, async args => {
          let file = args.path.replace(filter, "");
          let route = routesByFile.get(file);
          invariant["default"](route, `Cannot get route by path: ${args.path}`);
          let cacheKey = `module-exports:${route.id}`;
          let {
            cacheValue: theExports
          } = await ctx.fileWatchCache.getOrSet(cacheKey, async () => {
            let file = path__namespace.resolve(ctx.config.appDirectory, ctx.config.routes[route.id].file);
            return {
              cacheValue: await routeExports.getRouteModuleExports(ctx.config, route.id),
              fileDependencies: new Set([file])
            };
          });
          let contents = "module.exports = {};";
          if (theExports.includes("loader")) {
            contents = `export { loader } from ${JSON.stringify(`./${file}`)};`;
          }
          return {
            contents,
            resolveDir: ctx.config.appDirectory,
            loader: "js"
          };
        });
      }
    }, external.externalPlugin(/^node:.*/, {
      sideEffects: false
    }), external.externalPlugin(/\.css$/, {
      sideEffects: false
    }), external.externalPlugin(/^https?:\/\//, {
      sideEffects: false
    }), mdx.mdxPlugin(ctx), emptyModules.emptyModulesPlugin(ctx, /\.client(\.[jt]sx?)?$/), {
      name: "hmr-bare-modules",
      setup(build) {
        let matchPath = ctx.config.tsconfigPath ? tsconfig.createMatchPath(ctx.config.tsconfigPath) : undefined;
        function resolvePath(id) {
          if (!matchPath) return id;
          return matchPath(id, undefined, undefined, [".ts", ".tsx", ".js", ".jsx"]) || id;
        }
        build.onResolve({
          filter: /.*/
        }, args => {
          if (!isBareModuleId(resolvePath(args.path))) {
            return undefined;
          }
          return {
            path: args.path,
            external: true
          };
        });
      }
    }]
  };
  let {
    metafile
  } = await esbuild__default["default"].build(options);
  let entries = {};
  for (let [hashjs, {
    entryPoint
  }] of Object.entries(metafile.outputs)) {
    if (entryPoint === undefined) continue;
    let file = entryPoint.replace(/^hmr-loader:/, "").replace(/\?loader$/, "");
    entries[file] = hashjs.replace(/\.js$/, "");
  }
  return entries;
};

exports.detectLoaderChanges = detectLoaderChanges;
