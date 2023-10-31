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

var esbuild = require('esbuild');
var cancel = require('../cancel.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var esbuild__default = /*#__PURE__*/_interopDefaultLegacy(esbuild);

let toError = thrown => {
  if (thrown instanceof Error) return thrown;
  try {
    return new Error(JSON.stringify(thrown));
  } catch {
    // fallback in case there's an error stringifying.
    // for example, due to circular references.
    return new Error(String(thrown));
  }
};
let isEsbuildError = error => {
  return "warnings" in error && "errors" in error;
};
let logEsbuildError = error => {
  let warnings = esbuild__default["default"].formatMessagesSync(error.warnings, {
    kind: "warning",
    color: true
  });
  warnings.forEach(w => console.warn(w));
  let errors = esbuild__default["default"].formatMessagesSync(
  // Filter out cancelation errors
  error.errors.filter(e => !e.text.startsWith(cancel.CANCEL_PREFIX)), {
    kind: "error",
    color: true
  });
  errors.forEach(e => console.error(e));
};
let logThrown = thrown => {
  let error = toError(thrown);
  if (isEsbuildError(error)) {
    logEsbuildError(error);
    return;
  }
  console.error(error.message);
};

exports.logThrown = logThrown;
