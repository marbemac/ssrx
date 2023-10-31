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
var node_child_process = require('node:child_process');
var fse = require('fs-extra');
var getPort = require('get-port');
var prettyMs = require('pretty-ms');
var PackageJson = require('@npmcli/package-json');
var pc = require('picocolors');
var colors = require('../colors.js');
var build$1 = require('../compiler/build.js');
require('chokidar');
require('lodash.debounce');
var config = require('../config.js');
require('node:fs');
require('node:module');
require('esbuild');
require('node:url');
require('postcss-load-config');
require('postcss');
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
var log = require('../compiler/utils/log.js');
var liveReload = require('../devServer/liveReload.js');
var index = require('../devServer_unstable/index.js');
var format = require('../config/format.js');
var detectPackageManager = require('./detectPackageManager.js');
var useJavascript = require('./useJavascript.js');
var fileWatchCache = require('../compiler/fileWatchCache.js');
var logger = require('../tux/logger.js');

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
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var getPort__default = /*#__PURE__*/_interopDefaultLegacy(getPort);
var prettyMs__default = /*#__PURE__*/_interopDefaultLegacy(prettyMs);
var PackageJson__default = /*#__PURE__*/_interopDefaultLegacy(PackageJson);
var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);

async function init(projectDir, {
  deleteScript = true
} = {}) {
  let initScriptDir = path__namespace.join(projectDir, "remix.init");
  let initScript = path__namespace.resolve(initScriptDir, "index.js");
  if (!(await fse__default["default"].pathExists(initScript))) {
    return;
  }
  let initPackageJson = path__namespace.resolve(initScriptDir, "package.json");
  let packageManager = detectPackageManager.detectPackageManager() ?? "npm";
  if (await fse__default["default"].pathExists(initPackageJson)) {
    node_child_process.execSync(`${packageManager} install`, {
      cwd: initScriptDir,
      stdio: "ignore"
    });
  }
  let initFn = require(initScript);
  if (typeof initFn !== "function" && initFn.default) {
    initFn = initFn.default;
  }
  try {
    await initFn({
      packageManager,
      rootDirectory: projectDir
    });
    if (deleteScript) {
      await fse__default["default"].remove(initScriptDir);
    }
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${colors.error("🚨 Oops, remix.init failed")}\n\n${error.message}`;
    }
    throw error;
  }
}

/**
 * Keep the function around in v2 so that users with `remix setup` in a script
 * or postinstall hook can still run a build, but inform them that it's no
 * longer necessary, and we can remove it in v3.
 * @deprecated
 */
function setup() {
  console.warn("WARNING: The setup command is no longer necessary as of v2. This is a no-op. Please remove this from your dev and CI scripts, as it will be removed in v3.");
}
async function routes(remixRoot, formatArg) {
  let config$1 = await config.readConfig(remixRoot);
  let format$1 = format.isRoutesFormat(formatArg) ? formatArg : format.RoutesFormat.jsx;
  console.log(format.formatRoutes(config$1.routes, format$1));
}
async function build(remixRoot, mode, sourcemap = false) {
  mode = mode ?? "production";
  logger.logger.info(`building...` + pc__default["default"].gray(` (NODE_ENV=${mode})`));
  if (mode === "production" && sourcemap) {
    logger.logger.warn("🚨  source maps enabled in production", {
      details: ["You are using `--sourcemap` to enable source maps in production,", "making your server-side code publicly visible in the browser.", "This is highly discouraged!", "If you insist, ensure that you are using environment variables for secrets", "and are not hard-coding them in your source."]
    });
  }
  let start = Date.now();
  let config$1 = await config.readConfig(remixRoot);
  let options = {
    mode,
    sourcemap
  };
  if (mode === "development") {
    let resolved = await resolveDev(config$1);
    options.REMIX_DEV_ORIGIN = resolved.REMIX_DEV_ORIGIN;
  }
  let fileWatchCache$1 = fileWatchCache.createFileWatchCache();
  fse__default["default"].emptyDirSync(config$1.assetsBuildDirectory);
  await build$1.build({
    config: config$1,
    options,
    fileWatchCache: fileWatchCache$1,
    logger: logger.logger
  }).catch(thrown => {
    log.logThrown(thrown);
    process.exit(1);
  });
  logger.logger.info("built" + pc__default["default"].gray(` (${prettyMs__default["default"](Date.now() - start)})`));
}
async function watch(remixRootOrConfig, mode) {
  mode = mode ?? "development";
  console.log(`Watching Remix app in ${mode} mode...`);
  let config$1 = typeof remixRootOrConfig === "object" ? remixRootOrConfig : await config.readConfig(remixRootOrConfig);
  let resolved = await resolveDev(config$1);
  void liveReload.liveReload(config$1, {
    ...resolved,
    mode
  });
  return await new Promise(() => {});
}
async function dev(remixRoot, flags = {}) {
  console.log(`\n 💿  remix dev\n`);
  if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") {
    logger.logger.warn(`overriding NODE_ENV=${process.env.NODE_ENV} to development`);
  }
  process.env.NODE_ENV = "development";
  let config$1 = await config.readConfig(remixRoot);
  let resolved = await resolveDevServe(config$1, flags);
  index.serve(config$1, resolved);

  // keep `remix dev` alive by waiting indefinitely
  await new Promise(() => {});
}
let clientEntries = ["entry.client.tsx", "entry.client.js", "entry.client.jsx"];
let serverEntries = ["entry.server.tsx", "entry.server.js", "entry.server.jsx"];
let entries = ["entry.client", "entry.server"];
let conjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction"
});
let disjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction"
});
async function generateEntry(entry, remixRoot, useTypeScript = true) {
  let config$1 = await config.readConfig(remixRoot);

  // if no entry passed, attempt to create both
  if (!entry) {
    await generateEntry("entry.client", remixRoot, useTypeScript);
    await generateEntry("entry.server", remixRoot, useTypeScript);
    return;
  }
  if (!entries.includes(entry)) {
    let entriesArray = Array.from(entries);
    let list = conjunctionListFormat.format(entriesArray);
    console.error(colors.error(`Invalid entry file. Valid entry files are ${list}`));
    return;
  }
  let pkgJson = await PackageJson__default["default"].load(config$1.rootDirectory);
  let deps = pkgJson.content.dependencies ?? {};
  let serverRuntime = deps["@remix-run/deno"] ? "deno" : deps["@remix-run/cloudflare"] ? "cloudflare" : deps["@remix-run/node"] ? "node" : undefined;
  if (!serverRuntime) {
    let serverRuntimes = ["@remix-run/deno", "@remix-run/cloudflare", "@remix-run/node"];
    let formattedList = disjunctionListFormat.format(serverRuntimes);
    console.error(colors.error(`Could not determine server runtime. Please install one of the following: ${formattedList}`));
    return;
  }
  let defaultsDirectory = path__namespace.resolve(__dirname, "..", "config", "defaults");
  let defaultEntryClient = path__namespace.resolve(defaultsDirectory, "entry.client.tsx");
  let defaultEntryServer = path__namespace.resolve(defaultsDirectory, `entry.server.${serverRuntime}.tsx`);
  let isServerEntry = entry === "entry.server";
  let contents = isServerEntry ? await createServerEntry(config$1.rootDirectory, config$1.appDirectory, defaultEntryServer) : await createClientEntry(config$1.rootDirectory, config$1.appDirectory, defaultEntryClient);
  let outputExtension = useTypeScript ? "tsx" : "jsx";
  let outputEntry = `${entry}.${outputExtension}`;
  let outputFile = path__namespace.resolve(config$1.appDirectory, outputEntry);
  if (!useTypeScript) {
    let javascript = useJavascript.transpile(contents, {
      cwd: config$1.rootDirectory,
      filename: isServerEntry ? defaultEntryServer : defaultEntryClient
    });
    await fse__default["default"].writeFile(outputFile, javascript, "utf-8");
  } else {
    await fse__default["default"].writeFile(outputFile, contents, "utf-8");
  }
  console.log(colors.blue(`Entry file ${entry} created at ${path__namespace.relative(config$1.rootDirectory, outputFile)}.`));
}
async function checkForEntry(rootDirectory, appDirectory, entries) {
  for (let entry of entries) {
    let entryPath = path__namespace.resolve(appDirectory, entry);
    let exists = await fse__default["default"].pathExists(entryPath);
    if (exists) {
      let relative = path__namespace.relative(rootDirectory, entryPath);
      console.error(colors.error(`Entry file ${relative} already exists.`));
      return process.exit(1);
    }
  }
}
async function createServerEntry(rootDirectory, appDirectory, inputFile) {
  await checkForEntry(rootDirectory, appDirectory, serverEntries);
  let contents = await fse__default["default"].readFile(inputFile, "utf-8");
  return contents;
}
async function createClientEntry(rootDirectory, appDirectory, inputFile) {
  await checkForEntry(rootDirectory, appDirectory, clientEntries);
  let contents = await fse__default["default"].readFile(inputFile, "utf-8");
  return contents;
}
let findPort = async () => getPort__default["default"]({
  port: getPort.makeRange(3001, 3100)
});
let resolveDev = async (config, flags = {}) => {
  let {
    dev
  } = config;
  let port = flags.port ?? dev.port ?? (await findPort());
  let tlsKey = flags.tlsKey ?? dev.tlsKey;
  if (tlsKey) tlsKey = path__namespace.resolve(tlsKey);
  let tlsCert = flags.tlsCert ?? dev.tlsCert;
  if (tlsCert) tlsCert = path__namespace.resolve(tlsCert);
  let isTLS = tlsKey && tlsCert;
  let REMIX_DEV_ORIGIN = process.env.REMIX_DEV_ORIGIN;
  if (REMIX_DEV_ORIGIN === undefined) {
    let scheme = isTLS ? "https" : "http";
    REMIX_DEV_ORIGIN = `${scheme}://localhost:${port}`;
  }
  return {
    port,
    tlsKey,
    tlsCert,
    REMIX_DEV_ORIGIN: new URL(REMIX_DEV_ORIGIN)
  };
};
let resolveDevServe = async (config, flags = {}) => {
  let {
    dev
  } = config;
  let resolved = await resolveDev(config, flags);
  let command = flags.command ?? dev.command;
  let manual = flags.manual ?? dev.manual ?? false;
  return {
    ...resolved,
    command,
    manual
  };
};

exports.build = build;
exports.dev = dev;
exports.generateEntry = generateEntry;
exports.init = init;
exports.routes = routes;
exports.setup = setup;
exports.watch = watch;
