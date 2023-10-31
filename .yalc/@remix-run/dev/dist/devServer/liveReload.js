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

var exitHook = require('exit-hook');
var fse = require('fs-extra');
var path = require('node:path');
var prettyMs = require('pretty-ms');
var WebSocket = require('ws');
require('node:fs');
require('node:module');
require('esbuild');
require('node:url');
require('postcss-load-config');
require('postcss');
require('node:child_process');
require('@npmcli/package-json');
require('minimatch');
var logger = require('../tux/logger.js');
require('remark-mdx-frontmatter');
require('tsconfig-paths');
require('postcss-modules');
require('@babel/parser');
require('@babel/traverse');
require('@babel/generator');
require('../compiler/plugins/vanillaExtract.js');
require('postcss-discard-duplicates');
require('cacache');
require('node:crypto');
require('esbuild-plugins-node-modules-polyfill');
require('jsesc');
var watch = require('../compiler/watch.js');
var fileWatchCache = require('../compiler/fileWatchCache.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var exitHook__default = /*#__PURE__*/_interopDefaultLegacy(exitHook);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var prettyMs__default = /*#__PURE__*/_interopDefaultLegacy(prettyMs);
var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

const relativePath = file => path__default["default"].relative(process.cwd(), file);
let clean = config => {
  try {
    fse__default["default"].emptyDirSync(config.assetsBuildDirectory);
  } catch {
    // ignore failed clean up attempts
  }
};
async function liveReload(config, options) {
  clean(config);
  let wss = new WebSocket__default["default"].Server({
    port: options.port
  });
  function broadcast(event) {
    setTimeout(() => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket__default["default"].OPEN) {
          client.send(JSON.stringify(event));
        }
      });
    }, 500);
  }
  function log(message) {
    let _message = `💿 ${message}`;
    console.log(_message);
    broadcast({
      type: "LOG",
      message: _message
    });
  }
  let fileWatchCache$1 = fileWatchCache.createFileWatchCache();
  let hasBuilt = false;
  let dispose = await watch.watch({
    config,
    options: {
      mode: options.mode,
      sourcemap: true
    },
    fileWatchCache: fileWatchCache$1,
    logger: logger.logger
  }, {
    onBuildStart() {
      clean(config);
      log((hasBuilt ? "Rebuilding" : "Building") + "...");
    },
    onBuildFinish(_, durationMs, manifest) {
      if (manifest === undefined) return;
      hasBuilt = true;
      log((hasBuilt ? "Rebuilt" : "Built") + ` in ${prettyMs__default["default"](durationMs)}`);
      broadcast({
        type: "RELOAD"
      });
    },
    onFileCreated(file) {
      log(`File created: ${relativePath(file)}`);
    },
    onFileChanged(file) {
      log(`File changed: ${relativePath(file)}`);
      fileWatchCache$1.invalidateFile(file);
    },
    onFileDeleted(file) {
      log(`File deleted: ${relativePath(file)}`);
      fileWatchCache$1.invalidateFile(file);
    }
  });
  let heartbeat = setInterval(broadcast, 60000, {
    type: "PING"
  });
  exitHook__default["default"](() => clean(config));
  return async () => {
    wss.close();
    clearInterval(heartbeat);
    await dispose();
  };
}

exports.liveReload = liveReload;
