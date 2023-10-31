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

var fse = require('fs-extra');
var path = require('node:path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

let writeMetafile = (ctx, filename, metafile) => {
  let buildDir = path__default["default"].dirname(ctx.config.serverBuildPath);
  fse__default["default"].outputFileSync(path__default["default"].join(buildDir, filename), JSON.stringify(metafile));
};

exports.writeMetafile = writeMetafile;
