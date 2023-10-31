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

var babel = require('@babel/core');
var babelPluginSyntaxJSX = require('@babel/plugin-syntax-jsx');
var babelPresetTypeScript = require('@babel/preset-typescript');
var prettier = require('prettier');

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

var babel__namespace = /*#__PURE__*/_interopNamespace(babel);
var babelPluginSyntaxJSX__default = /*#__PURE__*/_interopDefaultLegacy(babelPluginSyntaxJSX);
var babelPresetTypeScript__default = /*#__PURE__*/_interopDefaultLegacy(babelPresetTypeScript);
var prettier__default = /*#__PURE__*/_interopDefaultLegacy(prettier);

function transpile(tsx, options = {}) {
  let mjs = babel__namespace.transformSync(tsx, {
    compact: false,
    cwd: options.cwd,
    filename: options.filename,
    plugins: [babelPluginSyntaxJSX__default["default"]],
    presets: [[babelPresetTypeScript__default["default"], {
      jsx: "preserve"
    }]],
    retainLines: true
  });
  if (!mjs || !mjs.code) throw new Error("Could not parse TypeScript");

  /**
   * Babel's `compact` and `retainLines` options are both bad at formatting code.
   * Use Prettier for nicer formatting.
   */
  return prettier__default["default"].format(mjs.code, {
    parser: "babel"
  });
}

exports.transpile = transpile;
