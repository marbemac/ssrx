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

var fse = require('fs-extra');
var path = require('node:path');

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

var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

// Import environment variables from: .env, failing gracefully if it doesn't exist
async function loadEnv(rootDirectory) {
  let envPath = path__namespace.join(rootDirectory, ".env");
  if (!fse__default["default"].existsSync(envPath)) return;
  let result = require("dotenv").config({
    path: envPath
  });
  if (result.error) throw result.error;
}

exports.loadEnv = loadEnv;
