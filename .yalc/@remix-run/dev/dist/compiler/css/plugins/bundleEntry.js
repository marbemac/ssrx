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

const cssBundleEntryModuleId = "__remix_cssBundleEntryModule__";
const filter = new RegExp(`^${cssBundleEntryModuleId}$`);

/**
 * Creates a virtual module that imports all browser build entry points so that
 * all reachable CSS can be included in a single file at the end of the build.
 */
function cssBundleEntryModulePlugin({
  config
}) {
  return {
    name: "css-bundle-entry-module",
    setup(build) {
      build.onResolve({
        filter
      }, ({
        path
      }) => {
        return {
          path,
          namespace: "css-bundle-entry-module"
        };
      });
      build.onLoad({
        filter
      }, async () => {
        return {
          resolveDir: config.appDirectory,
          loader: "js",
          contents: [
          // These need to be exports to avoid tree shaking
          `export * as entryClient from ${JSON.stringify(path__default["default"].resolve(config.rootDirectory, config.entryClientFilePath))};`, ...Object.keys(config.routes).map((key, index) => {
            let route = config.routes[key];
            return `export * as route${index} from ${JSON.stringify(`./${route.file}`)};`;
          })].join("\n")
        };
      });
    }
  };
}

exports.cssBundleEntryModuleId = cssBundleEntryModuleId;
exports.cssBundleEntryModulePlugin = cssBundleEntryModulePlugin;
