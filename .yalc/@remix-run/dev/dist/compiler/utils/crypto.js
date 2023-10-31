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

var fs = require('node:fs');
var node_crypto = require('node:crypto');

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

var fs__namespace = /*#__PURE__*/_interopNamespace(fs);

function getHash(source) {
  return node_crypto.createHash("sha256").update(source).digest("hex");
}
async function getFileHash(file) {
  return new Promise((accept, reject) => {
    let hash = node_crypto.createHash("sha256");
    fs__namespace.createReadStream(file).on("error", error => reject(error)).on("data", data => hash.update(data)).on("close", () => {
      accept(hash.digest("hex"));
    });
  });
}

exports.getFileHash = getFileHash;
exports.getHash = getHash;
