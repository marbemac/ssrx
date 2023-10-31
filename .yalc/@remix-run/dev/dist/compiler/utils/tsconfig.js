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

var tsConfigPaths = require('tsconfig-paths');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var tsConfigPaths__default = /*#__PURE__*/_interopDefaultLegacy(tsConfigPaths);

function createMatchPath(tsconfigPath) {
  // There is no tsconfig to match paths against.
  if (!tsconfigPath) {
    return undefined;
  }

  // When passing a absolute path, loadConfig assumes that the path contains
  // a tsconfig file.
  // Ref.: https://github.com/dividab/tsconfig-paths/blob/v4.0.0/src/__tests__/config-loader.test.ts#L74
  let configLoaderResult = tsConfigPaths__default["default"].loadConfig(tsconfigPath);
  if (configLoaderResult.resultType === "failed") {
    if (configLoaderResult.message === "Missing baseUrl in compilerOptions") {
      throw new Error(`🚨 Oops! No baseUrl found, please set compilerOptions.baseUrl in your tsconfig or jsconfig`);
    }
    return undefined;
  }
  return tsConfigPaths__default["default"].createMatchPath(configLoaderResult.absoluteBaseUrl, configLoaderResult.paths, configLoaderResult.mainFields, configLoaderResult.addMatchAll);
}

exports.createMatchPath = createMatchPath;
