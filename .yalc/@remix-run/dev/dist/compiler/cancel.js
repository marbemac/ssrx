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

const CANCEL_PREFIX = "remix-compile-cancel";
class Cancel extends Error {
  constructor(message) {
    super(`${CANCEL_PREFIX}: ${message}`);
  }
}

exports.CANCEL_PREFIX = CANCEL_PREFIX;
exports.Cancel = Cancel;
