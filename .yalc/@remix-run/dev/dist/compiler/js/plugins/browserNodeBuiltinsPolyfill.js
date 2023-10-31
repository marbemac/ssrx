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

const browserNodeBuiltinsPolyfillPlugin = ctx => {
  var _ctx$config$browserNo, _ctx$config$browserNo2;
  return esbuildPluginsNodeModulesPolyfill.nodeModulesPolyfillPlugin({
    // Rename plugin to improve error message attribution
    name: "browser-node-builtins-polyfill-plugin",
    // Only pass through the "modules" and "globals" options to ensure we
    // don't leak the full plugin API to Remix consumers.
    modules: ((_ctx$config$browserNo = ctx.config.browserNodeBuiltinsPolyfill) === null || _ctx$config$browserNo === void 0 ? void 0 : _ctx$config$browserNo.modules) ?? {},
    globals: ((_ctx$config$browserNo2 = ctx.config.browserNodeBuiltinsPolyfill) === null || _ctx$config$browserNo2 === void 0 ? void 0 : _ctx$config$browserNo2.globals) ?? {},
    // Mark any unpolyfilled Node builtins in the build output as errors.
    fallback: "error",
    formatError({
      moduleName,
      importer,
      polyfillExists
    }) {
      let normalizedModuleName = moduleName.replace("node:", "");
      let modulesConfigKey = /^[a-z_]+$/.test(normalizedModuleName) ? normalizedModuleName : JSON.stringify(normalizedModuleName);
      return {
        text: (polyfillExists ? [`Node builtin "${moduleName}" (imported by "${importer}") must be polyfilled for the browser. `, `You can enable this polyfill in your Remix config, `, `e.g. \`browserNodeBuiltinsPolyfill: { modules: { ${modulesConfigKey}: true } }\``] : [`Node builtin "${moduleName}" (imported by "${importer}") doesn't have a browser polyfill available. `, `You can stub it out with an empty object in your Remix config `, `e.g. \`browserNodeBuiltinsPolyfill: { modules: { ${modulesConfigKey}: "empty" } }\` `, "but note that this may cause runtime errors if the module is used in your browser code."]).join("")
      };
    }
  });
};

exports.browserNodeBuiltinsPolyfillPlugin = browserNodeBuiltinsPolyfillPlugin;
