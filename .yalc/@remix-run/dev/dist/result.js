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

let ok = value => ({
  ok: true,
  value
});
let err = error => ({
  ok: false,
  error
});

exports.err = err;
exports.ok = ok;
