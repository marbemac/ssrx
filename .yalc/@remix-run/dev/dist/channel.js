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

const create = () => {
  let _resolve;
  let _reject;
  let promise = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  }).catch(error => ({
    ok: false,
    error
  }));
  return {
    ok: value => _resolve({
      ok: true,
      value
    }),
    err: _reject,
    result: promise
  };
};

exports.create = create;
