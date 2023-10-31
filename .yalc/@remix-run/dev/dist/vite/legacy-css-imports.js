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

var parser = require('@babel/parser');
var t = require('@babel/types');
var traverse = require('@babel/traverse');
var generate = require('@babel/generator');

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

var t__namespace = /*#__PURE__*/_interopNamespace(t);
var traverse__default = /*#__PURE__*/_interopDefaultLegacy(traverse);
var generate__default = /*#__PURE__*/_interopDefaultLegacy(generate);

const transformLegacyCssImports = source => {
  let ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  });
  traverse__default["default"](ast, {
    // Handle `import styles from "./styles.css"`
    ImportDeclaration(path) {
      if (path.node.source.value.endsWith(".css") &&
      // CSS Modules are bundled in the Remix compiler so they're already
      // compatible with Vite's default CSS handling
      !path.node.source.value.endsWith(".module.css") && t__namespace.isImportDefaultSpecifier(path.node.specifiers[0])) {
        path.node.source.value += "?url";
      }
    }
  });
  return {
    code: generate__default["default"](ast, {
      retainLines: true
    }).code,
    map: null
  };
};

exports.transformLegacyCssImports = transformLegacyCssImports;
