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
var stream = require('node:stream');
var http = require('node:http');
var https = require('node:https');
var fse = require('fs-extra');
var prettyMs = require('pretty-ms');
var execa = require('execa');
var express = require('express');
var pc = require('picocolors');
var exitHook = require('exit-hook');
var channel = require('../channel.js');
require('node:fs');
require('node:module');
require('esbuild');
var invariant = require('../invariant.js');
require('node:url');
require('postcss-load-config');
require('postcss');
require('node:child_process');
require('@npmcli/package-json');
require('minimatch');
var detectPackageManager = require('../cli/detectPackageManager.js');
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
var result = require('../result.js');
var watch = require('../compiler/watch.js');
var fileWatchCache = require('../compiler/fileWatchCache.js');
var env = require('./env.js');
var socket = require('./socket.js');
var hmr = require('./hmr.js');
var hdr = require('./hdr.js');
var proc = require('./proc.js');

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

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var stream__namespace = /*#__PURE__*/_interopNamespace(stream);
var http__namespace = /*#__PURE__*/_interopNamespace(http);
var https__namespace = /*#__PURE__*/_interopNamespace(https);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var prettyMs__default = /*#__PURE__*/_interopDefaultLegacy(prettyMs);
var execa__default = /*#__PURE__*/_interopDefaultLegacy(execa);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);
var exitHook__default = /*#__PURE__*/_interopDefaultLegacy(exitHook);

let detectBin = async () => {
  let pkgManager = detectPackageManager.detectPackageManager() ?? "npm";
  if (pkgManager === "npm") {
    // npm v9 removed the `bin` command, so have to use `prefix`
    let {
      stdout
    } = await execa__default["default"](pkgManager, ["prefix"]);
    return path__namespace.join(stdout.trim(), "node_modules", ".bin");
  }
  if (pkgManager === "bun") {
    let {
      stdout
    } = await execa__default["default"](pkgManager, ["pm", "bin"]);
    return stdout.trim();
  }
  let {
    stdout
  } = await execa__default["default"](pkgManager, ["bin"]);
  return stdout.trim();
};
let serve = async (initialConfig, options) => {
  await env.loadEnv(initialConfig.rootDirectory);
  let state = {};
  let app = express__default["default"]()
  // handle `broadcastDevReady` messages
  .use(express__default["default"].json()).post("/ping", (req, res) => {
    var _state$manifest;
    let {
      buildHash
    } = req.body;
    if (typeof buildHash !== "string") {
      logger.logger.warn(`unrecognized payload: ${req.body}`);
      res.sendStatus(400);
    }
    if (buildHash === ((_state$manifest = state.manifest) === null || _state$manifest === void 0 ? void 0 : _state$manifest.version)) {
      var _state$appReady;
      (_state$appReady = state.appReady) === null || _state$appReady === void 0 ? void 0 : _state$appReady.ok();
    }
    res.sendStatus(200);
  });
  let server = options.tlsKey && options.tlsCert ? https__namespace.createServer({
    key: fse__default["default"].readFileSync(options.tlsKey),
    cert: fse__default["default"].readFileSync(options.tlsCert)
  }, app) : http__namespace.createServer(app);
  let websocket = socket.serve(server);
  let bin = await detectBin();
  let startAppServer = command => {
    let cmd = command ?? `remix-serve ${path__namespace.relative(process.cwd(), initialConfig.serverBuildPath)}`;
    let newAppServer = execa__default["default"].command(cmd, {
      stdio: "pipe",
      env: {
        NODE_ENV: "development",
        PATH: bin + (process.platform === "win32" ? ";" : ":") + process.env.PATH,
        REMIX_DEV_ORIGIN: options.REMIX_DEV_ORIGIN.href,
        FORCE_COLOR: process.env.NO_COLOR === undefined ? "1" : "0"
      },
      // https://github.com/sindresorhus/execa/issues/433
      windowsHide: false
    }).on("error", e => {
      // patch execa error types
      invariant["default"]("errno" in e && typeof e.errno === "number", "errno missing");
      invariant["default"]("code" in e && typeof e.code === "string", "code missing");
      invariant["default"]("path" in e && typeof e.path === "string", "path missing");
      if (command === undefined) {
        logger.logger.error(`command not found: ${e.path}`, {
          details: [`\`remix dev\` did not receive \`--command\` nor \`-c\`, defaulting to \`${cmd}\`.`, "You probably meant to use `-c` for your app server command.", "For example: `remix dev -c 'node ./server.js'`"]
        });
        process.exit(1);
      }
      logger.logger.error("app failed to start" + pc__default["default"].gray(` (${command})`));
      throw e;
    });
    if (newAppServer.stdin) process.stdin.pipe(newAppServer.stdin, {
      end: true
    });
    if (newAppServer.stderr) newAppServer.stderr.pipe(process.stderr, {
      end: false
    });
    if (newAppServer.stdout) {
      newAppServer.stdout.pipe(new stream__namespace.PassThrough({
        transform(chunk, _, callback) {
          let str = chunk.toString();
          let matches = str && str.matchAll(/\[REMIX DEV\] ([A-Fa-f0-9]+) ready/g);
          if (matches) {
            for (let match of matches) {
              var _state$manifest2;
              let buildHash = match[1];
              if (buildHash === ((_state$manifest2 = state.manifest) === null || _state$manifest2 === void 0 ? void 0 : _state$manifest2.version)) {
                var _state$appReady2;
                (_state$appReady2 = state.appReady) === null || _state$appReady2 === void 0 ? void 0 : _state$appReady2.ok();
              }
            }
          }
          callback(null, chunk);
        }
      })).pipe(process.stdout, {
        end: false
      });
    }
    return newAppServer;
  };
  let fileWatchCache$1 = fileWatchCache.createFileWatchCache();
  let dispose = await watch.watch({
    config: initialConfig,
    options: {
      mode: "development",
      sourcemap: true,
      REMIX_DEV_ORIGIN: options.REMIX_DEV_ORIGIN
    },
    fileWatchCache: fileWatchCache$1,
    logger: logger.logger
  }, {
    onBuildStart: async ctx => {
      var _state$appReady3;
      // stop listening for previous manifest
      (_state$appReady3 = state.appReady) === null || _state$appReady3 === void 0 ? void 0 : _state$appReady3.err();
      clean(ctx.config);
      if (!state.prevManifest) {
        let msg = "building...";
        websocket.log(msg);
        logger.logger.info(msg);
      }
      state.loaderChanges = hdr.detectLoaderChanges(ctx).then(result.ok, result.err);
    },
    onBuildManifest: manifest => {
      state.manifest = manifest;
      state.appReady = channel.create();
    },
    onBuildFinish: async (ctx, durationMs, succeeded) => {
      if (!succeeded) return;
      let msg = (state.prevManifest ? "rebuilt" : "built") + pc__default["default"].gray(` (${prettyMs__default["default"](durationMs)})`);
      websocket.log(msg);
      logger.logger.info(msg);

      // accumulate new state, but only update state after updates are processed
      let newState = {
        prevManifest: state.manifest
      };
      try {
        let start = Date.now();
        if (state.appServer === undefined || !options.manual) {
          var _state$appServer;
          if ((_state$appServer = state.appServer) !== null && _state$appServer !== void 0 && _state$appServer.pid) {
            await proc.killtree(state.appServer.pid);
          }
          state.appServer = startAppServer(options.command);
        }
        let appReady = await state.appReady.result;
        if (!appReady.ok) return;
        if (state.prevManifest) {
          logger.logger.info(`app server ready` + pc__default["default"].gray(` (${prettyMs__default["default"](Date.now() - start)})`));
        }

        // HMR + HDR
        let loaderChanges = await state.loaderChanges;
        if (loaderChanges.ok) {
          newState.prevLoaderHashes = loaderChanges.value;
        }
        if (loaderChanges !== null && loaderChanges !== void 0 && loaderChanges.ok && state.manifest && state.prevManifest) {
          let updates = hmr.updates(ctx.config, state.manifest, state.prevManifest, loaderChanges.value, state.prevLoaderHashes);
          websocket.hmr(state.manifest, updates);
          let hdr = updates.some(u => u.revalidate);
          logger.logger.info("hmr" + (hdr ? " + hdr" : ""));
          return;
        }

        // Live Reload
        if (state.prevManifest !== undefined) {
          websocket.reload();
          logger.logger.info("live reload");
        }
      } finally {
        // commit accumulated state
        Object.assign(state, newState);
        process.stdout.write("\n");
      }
    },
    onFileCreated: file => {
      logger.logger.info(`rebuilding...` + pc__default["default"].gray(` (+ ${relativePath(file)})`));
      websocket.log(`file created: ${relativePath(file)}`);
    },
    onFileChanged: file => {
      logger.logger.info(`rebuilding...` + pc__default["default"].gray(` (~ ${relativePath(file)})`));
      websocket.log(`file changed: ${relativePath(file)}`);
      fileWatchCache$1.invalidateFile(file);
    },
    onFileDeleted: file => {
      logger.logger.info(`rebuilding` + pc__default["default"].gray(` (- ${relativePath(file)})`));
      websocket.log(`file deleted: ${relativePath(file)}`);
      fileWatchCache$1.invalidateFile(file);
    }
  });
  server.listen(options.port);
  let cleanup = async () => {
    var _state$appServer2;
    (_state$appServer2 = state.appServer) === null || _state$appServer2 === void 0 ? void 0 : _state$appServer2.kill();
    websocket.close();
    server.close();
    await dispose();
  };
  exitHook__default["default"](cleanup);
  return cleanup;
};
let clean = config => {
  try {
    fse__default["default"].emptyDirSync(config.relativeAssetsBuildDirectory);
  } catch {}
};
let relativePath = file => path__namespace.relative(process.cwd(), file);

exports.serve = serve;
