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

const externalPlugin = (filter, options = {}) => {
  return {
    name: "external",
    setup(build) {
      build.onResolve({
        filter
      }, () => {
        return {
          external: true,
          sideEffects: options.sideEffects
        };
      });
    }
  };
};

exports.externalPlugin = externalPlugin;
