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

let id = name => `virtual:${name}`;
let resolve = id => `\0${id}`;
let url = id => `/@id/__x00__${id}`;

exports.id = id;
exports.resolve = resolve;
exports.url = url;
