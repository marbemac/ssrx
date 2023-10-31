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
require('@babel/types');
var traverse = require('@babel/traverse');
var generate = require('@babel/generator');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var traverse__default = /*#__PURE__*/_interopDefaultLegacy(traverse);
var generate__default = /*#__PURE__*/_interopDefaultLegacy(generate);

const replaceImportSpecifier = ({
  code,
  specifier,
  replaceWith
}) => {
  let ast = parser.parse(code, {
    sourceType: "module"
  });
  traverse__default["default"](ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === specifier) {
        path.node.source.value = replaceWith;
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

exports.replaceImportSpecifier = replaceImportSpecifier;
