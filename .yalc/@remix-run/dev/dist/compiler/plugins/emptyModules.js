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

/**
 * This plugin substitutes an empty module for any modules in the `app`
 * directory that match the given `filter`.
 */
function emptyModulesPlugin({
  config
}, filter, {
  includeNodeModules = false
} = {}) {
  return {
    name: "empty-modules",
    setup(build) {
      build.onResolve({
        filter
      }, args => {
        if (includeNodeModules ||
        // Limit this behavior to modules found in only the `app` directory.
        // This allows node_modules to use the `.server.js` and `.client.js`
        // naming conventions with different semantics.
        path__namespace.resolve(args.resolveDir, args.path).startsWith(config.appDirectory)) {
          return {
            path: args.path,
            namespace: "empty-module"
          };
        }
      });
      build.onLoad({
        filter: /.*/,
        namespace: "empty-module"
      }, () => {
        return {
          // Use an empty CommonJS module here instead of ESM to avoid "No
          // matching export" errors in esbuild for stuff that is imported
          // from this file.
          contents: "module.exports = {};",
          loader: "js"
        };
      });
    }
  };
}

exports.emptyModulesPlugin = emptyModulesPlugin;
