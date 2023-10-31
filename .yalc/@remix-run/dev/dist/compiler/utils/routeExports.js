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

var path = require('node:path');
var esbuild = require('esbuild');
var cache = require('../../cache.js');
var mdx = require('../plugins/mdx.js');
var crypto = require('./crypto.js');

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

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var esbuild__namespace = /*#__PURE__*/_interopNamespace(esbuild);

async function getRouteModuleExports(config, routeId) {
  let file = path__namespace.resolve(config.appDirectory, config.routes[routeId].file);
  let hash = await crypto.getFileHash(file);
  let key = routeId + ".exports";
  let cached = null;
  try {
    cached = await cache.getJson(config.cacheDirectory, key);
  } catch (error) {
    // Ignore cache read errors.
  }
  if (!cached || cached.hash !== hash) {
    let exports = await _getRouteModuleExports(config, routeId);
    cached = {
      hash,
      exports
    };
    try {
      await cache.putJson(config.cacheDirectory, key, cached);
    } catch (error) {
      // Ignore cache put errors.
    }
  }

  // Layout routes can't have actions
  if (routeId.match(/\/__[\s\w\d_-]+$/) && cached.exports.includes("action")) {
    throw new Error(`Actions are not supported in layout routes: ${routeId}`);
  }
  return cached.exports;
}
async function _getRouteModuleExports(config, routeId) {
  let result = await esbuild__namespace.build({
    entryPoints: [path__namespace.resolve(config.appDirectory, config.routes[routeId].file)],
    platform: "neutral",
    format: "esm",
    metafile: true,
    write: false,
    loader: {
      ".js": "jsx"
    },
    logLevel: "silent",
    plugins: [mdx.mdxPlugin({
      config
    })]
  });
  let metafile = result.metafile;
  for (let key in metafile.outputs) {
    let output = metafile.outputs[key];
    if (output.entryPoint) return output.exports;
  }
  throw new Error(`Unable to get exports for route ${routeId}`);
}

exports.getRouteModuleExports = getRouteModuleExports;
