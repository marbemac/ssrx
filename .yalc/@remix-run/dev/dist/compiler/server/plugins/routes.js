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
var fse = require('fs-extra');
var loaders = require('../../utils/loaders.js');

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
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);

/**
 * This plugin loads route modules for the server build and prevents errors
 * while adding new files in development mode.
 */
function serverRouteModulesPlugin({
  config
}) {
  return {
    name: "server-route-modules",
    setup(build) {
      let routeFiles = new Set(Object.keys(config.routes).map(key => path__namespace.resolve(config.appDirectory, config.routes[key].file)));
      build.onResolve({
        filter: /.*/
      }, args => {
        if (routeFiles.has(args.path)) {
          return {
            path: args.path,
            namespace: "route"
          };
        }
      });
      build.onLoad({
        filter: /.*/,
        namespace: "route"
      }, async args => {
        let file = args.path;
        let contents = await fse__default["default"].readFile(file, "utf-8");

        // Default to `export {}` if the file is empty so esbuild interprets
        // this file as ESM instead of CommonJS with `default: {}`. This helps
        // in development when creating new files.
        // See https://github.com/evanw/esbuild/issues/1043
        if (!/\S/.test(contents)) {
          return {
            contents: "export {}",
            loader: "js"
          };
        }
        return {
          contents,
          resolveDir: path__namespace.dirname(file),
          loader: loaders.getLoaderForFile(file)
        };
      });
    }
  };
}

exports.serverRouteModulesPlugin = serverRouteModulesPlugin;
