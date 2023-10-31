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
var postcss = require('postcss');
var postcssDiscardDuplicates = require('postcss-discard-duplicates');

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
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);
var postcssDiscardDuplicates__default = /*#__PURE__*/_interopDefaultLegacy(postcssDiscardDuplicates);

let write = async (ctx, outputFiles) => {
  var _outputFiles$find;
  let cssBundleFile = outputFiles.find(outputFile => isBundle(ctx, outputFile, ".css"));
  if (!cssBundleFile) return;
  let cssBundlePath = cssBundleFile.path;
  let {
    css,
    map
  } = await postcss__default["default"]([
  // We need to discard duplicate rules since "composes"
  // in CSS Modules can result in duplicate styles
  postcssDiscardDuplicates__default["default"]()]).process(cssBundleFile.text, {
    from: cssBundlePath,
    to: cssBundlePath,
    map: ctx.options.sourcemap && {
      prev: (_outputFiles$find = outputFiles.find(outputFile => isBundle(ctx, outputFile, ".css.map"))) === null || _outputFiles$find === void 0 ? void 0 : _outputFiles$find.text,
      inline: false,
      annotation: false,
      sourcesContent: true
    }
  });
  await fse__default["default"].ensureDir(path__namespace.dirname(cssBundlePath));
  await Promise.all([fse__default["default"].writeFile(cssBundlePath, css), ctx.options.mode !== "production" && map ? fse__default["default"].writeFile(`${cssBundlePath}.map`, map.toString()) // Write our updated source map rather than esbuild's
  : null, ...outputFiles.filter(outputFile => !/\.(css|js|map)$/.test(outputFile.path)).map(async asset => {
    await fse__default["default"].ensureDir(path__namespace.dirname(asset.path));
    await fse__default["default"].writeFile(asset.path, asset.contents);
  })]);
};
let isBundle = (ctx, outputFile, extension) => {
  return path__namespace.dirname(outputFile.path) === ctx.config.assetsBuildDirectory && path__namespace.basename(outputFile.path).startsWith("css-bundle") && outputFile.path.endsWith(extension);
};

exports.isBundle = isBundle;
exports.write = write;
