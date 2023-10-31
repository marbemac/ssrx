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

var chokidar = require('chokidar');
var debounce = require('lodash.debounce');
var path = require('node:path');
var config = require('../config.js');
var compiler = require('./compiler.js');
var log = require('./utils/log.js');
var routes = require('../config/routes.js');

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

var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
var debounce__default = /*#__PURE__*/_interopDefaultLegacy(debounce);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

function isEntryPoint(config, file) {
  let configFile = path__namespace.join(config.rootDirectory, "remix.config.js");
  let appFile = path__namespace.relative(config.appDirectory, file);
  let entryPoints = [configFile, config.entryClientFile, config.entryServerFile, ...Object.values(config.routes).map(route => route.file)];
  let normalized = routes.normalizeSlashes(appFile);
  return entryPoints.includes(normalized);
}
function shouldIgnore(file) {
  let filename = path__namespace.basename(file);
  return filename === ".DS_Store";
}
async function watch(ctx, {
  reloadConfig = config.readConfig,
  onBuildStart,
  onBuildManifest,
  onBuildFinish,
  onFileCreated,
  onFileChanged,
  onFileDeleted
} = {}) {
  var _ctx$config$watchPath;
  let start = Date.now();
  let compiler$1 = await compiler.create(ctx);
  let compile = () => compiler$1.compile({
    onManifest: onBuildManifest
  }).catch(thrown => {
    if (thrown instanceof Error && thrown.message === "The service is no longer running") {
      ctx.logger.error("esbuild is no longer running", {
        details: ["Most likely, your machine ran out of memory and killed the esbuild process", "that `remix dev` relies on for builds and rebuilds."]
      });
      process.exit(1);
    }
    log.logThrown(thrown);
    return undefined;
  });

  // initial build
  onBuildStart === null || onBuildStart === void 0 ? void 0 : onBuildStart(ctx);
  let manifest = await compile();
  onBuildFinish === null || onBuildFinish === void 0 ? void 0 : onBuildFinish(ctx, Date.now() - start, manifest !== undefined);
  let restart = debounce__default["default"](async () => {
    let start = Date.now();
    void compiler$1.dispose();
    try {
      ctx.config = await reloadConfig(ctx.config.rootDirectory);
    } catch (thrown) {
      log.logThrown(thrown);
      return;
    }
    onBuildStart === null || onBuildStart === void 0 ? void 0 : onBuildStart(ctx);
    compiler$1 = await compiler.create(ctx);
    let manifest = await compile();
    onBuildFinish === null || onBuildFinish === void 0 ? void 0 : onBuildFinish(ctx, Date.now() - start, manifest !== undefined);
  }, 500);
  let rebuild = debounce__default["default"](async () => {
    await compiler$1.cancel();
    onBuildStart === null || onBuildStart === void 0 ? void 0 : onBuildStart(ctx);
    let start = Date.now();
    let manifest = await compile();
    onBuildFinish === null || onBuildFinish === void 0 ? void 0 : onBuildFinish(ctx, Date.now() - start, manifest !== undefined);
  }, 100);
  let remixConfigPath = path__namespace.join(ctx.config.rootDirectory, "remix.config.js");
  let toWatch = [remixConfigPath, ctx.config.appDirectory];

  // WARNING: Chokidar returns different paths in change events depending on
  // whether the path provided to the watcher is absolute or relative. If the
  // path is absolute, change events will contain absolute paths, and the
  // opposite for relative paths. We need to ensure that the paths we provide
  // are always absolute to ensure consistency in change events.
  if (ctx.config.serverEntryPoint) {
    toWatch.push(path__namespace.resolve(ctx.config.rootDirectory, ctx.config.serverEntryPoint));
  }
  (_ctx$config$watchPath = ctx.config.watchPaths) === null || _ctx$config$watchPath === void 0 ? void 0 : _ctx$config$watchPath.forEach(watchPath => {
    toWatch.push(path__namespace.resolve(ctx.config.rootDirectory, watchPath));
  });
  let watcher = chokidar__default["default"].watch(toWatch, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  }).on("error", error => ctx.logger.error(String(error))).on("change", async file => {
    if (shouldIgnore(file)) return;
    onFileChanged === null || onFileChanged === void 0 ? void 0 : onFileChanged(file);
    await (file === remixConfigPath ? restart : rebuild)();
  }).on("add", async file => {
    if (shouldIgnore(file)) return;
    onFileCreated === null || onFileCreated === void 0 ? void 0 : onFileCreated(file);
    try {
      ctx.config = await reloadConfig(ctx.config.rootDirectory);
    } catch (thrown) {
      log.logThrown(thrown);
      return;
    }
    await (isEntryPoint(ctx.config, file) ? restart : rebuild)();
  }).on("unlink", async file => {
    if (shouldIgnore(file)) return;
    onFileDeleted === null || onFileDeleted === void 0 ? void 0 : onFileDeleted(file);
    await (isEntryPoint(ctx.config, file) ? restart : rebuild)();
  });
  return async () => {
    await watcher.close().catch(() => undefined);
    void compiler$1.dispose();
  };
}

exports.watch = watch;
