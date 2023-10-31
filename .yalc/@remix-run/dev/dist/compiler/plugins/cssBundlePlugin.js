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

const pluginName = "css-bundle-plugin";
const namespace = `${pluginName}-ns`;

/**
 * This plugin lazily requests the CSS bundle href and then injects it into the
 * JS for `@remix-run/css-bundle`. This ensures we only run the CSS bundle build
 * if necessary and that changes to the CSS bundle result in an HMR update.
 */
function cssBundlePlugin(refs) {
  return {
    name: pluginName,
    async setup(build) {
      build.onResolve({
        filter: /^@remix-run\/css-bundle$/
      }, async args => {
        return {
          path: args.path,
          namespace
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace
      }, async () => {
        let cssBundleHref = await refs.lazyCssBundleHref.get();
        return {
          loader: "js",
          contents: `export const cssBundleHref = ${cssBundleHref ? JSON.stringify(cssBundleHref) : "undefined"};`
        };
      });
    }
  };
}

exports.cssBundlePlugin = cssBundlePlugin;
