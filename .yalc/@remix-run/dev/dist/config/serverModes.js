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

/**
 * The mode to use when running the server.
 */
let ServerMode = /*#__PURE__*/function (ServerMode) {
  ServerMode["Development"] = "development";
  ServerMode["Production"] = "production";
  ServerMode["Test"] = "test";
  return ServerMode;
}({});
function isValidServerMode(mode) {
  return mode === ServerMode.Development || mode === ServerMode.Production || mode === ServerMode.Test;
}

exports.ServerMode = ServerMode;
exports.isValidServerMode = isValidServerMode;
