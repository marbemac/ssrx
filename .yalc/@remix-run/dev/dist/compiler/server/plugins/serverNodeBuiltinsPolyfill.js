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

var esbuildPluginsNodeModulesPolyfill = require('esbuild-plugins-node-modules-polyfill');

const serverNodeBuiltinsPolyfillPlugin = ctx => {
  var _ctx$config$serverNod, _ctx$config$serverNod2;
  return esbuildPluginsNodeModulesPolyfill.nodeModulesPolyfillPlugin({
    // Rename plugin to improve error message attribution
    name: "server-node-builtins-polyfill-plugin",
    // Only pass through the "modules" and "globals" options to ensure we
    // don't leak the full plugin API to Remix consumers.
    modules: ((_ctx$config$serverNod = ctx.config.serverNodeBuiltinsPolyfill) === null || _ctx$config$serverNod === void 0 ? void 0 : _ctx$config$serverNod.modules) ?? {},
    globals: ((_ctx$config$serverNod2 = ctx.config.serverNodeBuiltinsPolyfill) === null || _ctx$config$serverNod2 === void 0 ? void 0 : _ctx$config$serverNod2.globals) ?? {},
    // Since the server environment may provide its own Node polyfills,
    // we don't define any fallback behavior here and allow all Node
    // builtins to be marked as external
    fallback: "none"
  });
};

exports.serverNodeBuiltinsPolyfillPlugin = serverNodeBuiltinsPolyfillPlugin;
