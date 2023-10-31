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

/**
 * This plugin treats absolute paths in 'url()' css rules as external to prevent
 * breaking changes
 */
const absoluteCssUrlsPlugin = () => {
  return {
    name: "absolute-css-urls-plugin",
    setup: async build => {
      build.onResolve({
        filter: /.*/
      }, async args => {
        let {
          kind,
          path: resolvePath
        } = args;
        if (kind === "url-token" && path__default["default"].isAbsolute(resolvePath)) {
          return {
            path: resolvePath,
            external: true
          };
        }
      });
    }
  };
};

exports.absoluteCssUrlsPlugin = absoluteCssUrlsPlugin;
