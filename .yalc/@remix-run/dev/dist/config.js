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

var node_child_process = require('node:child_process');
var path = require('node:path');
var node_url = require('node:url');
var fse = require('fs-extra');
var PackageJson = require('@npmcli/package-json');
var routes = require('./config/routes.js');
var serverModes = require('./config/serverModes.js');
var virtualModules = require('./compiler/server/virtualModules.js');
var flatRoutes = require('./config/flat-routes.js');
var detectPackageManager = require('./cli/detectPackageManager.js');
var logger = require('./tux/logger.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var PackageJson__default = /*#__PURE__*/_interopDefaultLegacy(PackageJson);

/**
 * The user-provided config in `remix.config.js`.
 */

/**
 * Fully resolved configuration object we use throughout Remix.
 */

/**
 * Returns a fully resolved config object from the remix.config.js in the given
 * root directory.
 */
async function readConfig(remixRoot, serverMode) {
  if (!remixRoot) {
    remixRoot = process.env.REMIX_ROOT || process.cwd();
  }
  let rootDirectory = path__default["default"].resolve(remixRoot);
  let configFile = findConfig(rootDirectory, "remix.config", configExts);
  let appConfig = {};
  if (configFile) {
    let appConfigModule;
    try {
      var _appConfigModule;
      // shout out to next
      // https://github.com/vercel/next.js/blob/b15a976e11bf1dc867c241a4c1734757427d609c/packages/next/server/config.ts#L748-L765
      if (process.env.JEST_WORKER_ID) {
        // dynamic import does not currently work inside vm which
        // jest relies on, so we fall back to require for this case
        // https://github.com/nodejs/node/issues/35889
        appConfigModule = require(configFile);
      } else {
        let stat = fse__default["default"].statSync(configFile);
        appConfigModule = await import(node_url.pathToFileURL(configFile).href + "?t=" + stat.mtimeMs);
      }
      appConfig = ((_appConfigModule = appConfigModule) === null || _appConfigModule === void 0 ? void 0 : _appConfigModule.default) || appConfigModule;
    } catch (error) {
      throw new Error(`Error loading Remix config at ${configFile}\n${String(error)}`);
    }
  }
  return await resolveConfig(appConfig, {
    rootDirectory,
    serverMode
  });
}
async function resolveConfig(appConfig, {
  rootDirectory,
  serverMode = serverModes.ServerMode.Production
}) {
  var _appConfig$future;
  if (!serverModes.isValidServerMode(serverMode)) {
    throw new Error(`Invalid server mode "${serverMode}"`);
  }
  let serverBuildPath = path__default["default"].resolve(rootDirectory, appConfig.serverBuildPath ?? "build/index.js");
  let serverBuildTargetEntryModule = `export * from ${JSON.stringify(virtualModules.serverBuildVirtualModule.id)};`;
  let serverConditions = appConfig.serverConditions;
  let serverDependenciesToBundle = appConfig.serverDependenciesToBundle || [];
  let serverEntryPoint = appConfig.server;
  let serverMainFields = appConfig.serverMainFields;
  let serverMinify = appConfig.serverMinify;
  let serverModuleFormat = appConfig.serverModuleFormat || "esm";
  let serverPlatform = appConfig.serverPlatform || "node";
  serverMainFields ??= serverModuleFormat === "esm" ? ["module", "main"] : ["main", "module"];
  serverMinify ??= false;
  let serverNodeBuiltinsPolyfill = appConfig.serverNodeBuiltinsPolyfill;
  let browserNodeBuiltinsPolyfill = appConfig.browserNodeBuiltinsPolyfill;
  let mdx = appConfig.mdx;
  let postcss = appConfig.postcss ?? true;
  let tailwind = appConfig.tailwind ?? true;
  let appDirectory = path__default["default"].resolve(rootDirectory, appConfig.appDirectory || "app");
  let cacheDirectory = path__default["default"].resolve(rootDirectory, appConfig.cacheDirectory || ".cache");
  let defaultsDirectory = path__default["default"].resolve(__dirname, "config", "defaults");
  let userEntryClientFile = findEntry(appDirectory, "entry.client");
  let userEntryServerFile = findEntry(appDirectory, "entry.server");
  let entryServerFile;
  let entryClientFile = userEntryClientFile || "entry.client.tsx";
  let pkgJson = await PackageJson__default["default"].load(rootDirectory);
  let deps = pkgJson.content.dependencies ?? {};
  if (userEntryServerFile) {
    entryServerFile = userEntryServerFile;
  } else {
    let serverRuntime = deps["@remix-run/deno"] ? "deno" : deps["@remix-run/cloudflare"] ? "cloudflare" : deps["@remix-run/node"] ? "node" : undefined;
    if (!serverRuntime) {
      let serverRuntimes = ["@remix-run/deno", "@remix-run/cloudflare", "@remix-run/node"];
      let formattedList = disjunctionListFormat.format(serverRuntimes);
      throw new Error(`Could not determine server runtime. Please install one of the following: ${formattedList}`);
    }
    if (!deps["isbot"]) {
      console.log("adding `isbot` to your package.json, you should commit this change");
      pkgJson.update({
        dependencies: {
          ...pkgJson.content.dependencies,
          isbot: "latest"
        }
      });
      await pkgJson.save();
      let packageManager = detectPackageManager.detectPackageManager() ?? "npm";
      node_child_process.execSync(`${packageManager} install`, {
        cwd: rootDirectory,
        stdio: "inherit"
      });
    }
    entryServerFile = `entry.server.${serverRuntime}.tsx`;
  }
  let entryClientFilePath = userEntryClientFile ? path__default["default"].resolve(appDirectory, userEntryClientFile) : path__default["default"].resolve(defaultsDirectory, entryClientFile);
  let entryServerFilePath = userEntryServerFile ? path__default["default"].resolve(appDirectory, userEntryServerFile) : path__default["default"].resolve(defaultsDirectory, entryServerFile);
  let assetsBuildDirectory = appConfig.assetsBuildDirectory || path__default["default"].join("public", "build");
  let absoluteAssetsBuildDirectory = path__default["default"].resolve(rootDirectory, assetsBuildDirectory);
  let publicPath = addTrailingSlash(appConfig.publicPath || "/build/");
  let rootRouteFile = findEntry(appDirectory, "root");
  if (!rootRouteFile) {
    throw new Error(`Missing "root" route file in ${appDirectory}`);
  }
  let routes$1 = {
    root: {
      path: "",
      id: "root",
      file: rootRouteFile
    }
  };
  if (fse__default["default"].existsSync(path__default["default"].resolve(appDirectory, "routes"))) {
    let fileRoutes = flatRoutes.flatRoutes(appDirectory, appConfig.ignoredRouteFiles);
    for (let route of Object.values(fileRoutes)) {
      routes$1[route.id] = {
        ...route,
        parentId: route.parentId || "root"
      };
    }
  }
  if (appConfig.routes) {
    let manualRoutes = await appConfig.routes(routes.defineRoutes);
    for (let route of Object.values(manualRoutes)) {
      routes$1[route.id] = {
        ...route,
        parentId: route.parentId || "root"
      };
    }
  }
  let watchPaths = [];
  if (typeof appConfig.watchPaths === "function") {
    let directories = await appConfig.watchPaths();
    watchPaths = watchPaths.concat(Array.isArray(directories) ? directories : [directories]);
  } else if (appConfig.watchPaths) {
    watchPaths = watchPaths.concat(Array.isArray(appConfig.watchPaths) ? appConfig.watchPaths : [appConfig.watchPaths]);
  }

  // When tsconfigPath is undefined, the default "tsconfig.json" is not
  // found in the root directory.
  let tsconfigPath;
  let rootTsconfig = path__default["default"].resolve(rootDirectory, "tsconfig.json");
  let rootJsConfig = path__default["default"].resolve(rootDirectory, "jsconfig.json");
  if (fse__default["default"].existsSync(rootTsconfig)) {
    tsconfigPath = rootTsconfig;
  } else if (fse__default["default"].existsSync(rootJsConfig)) {
    tsconfigPath = rootJsConfig;
  }

  // Note: When a future flag is removed from here, it should be added to the
  // list below, so we can let folks know if they have obsolete flags in their
  // config.  If we ever convert remix.config.js to a TS file, so we get proper
  // typings this won't be necessary anymore.
  let future = {
    v3_fetcherPersist: ((_appConfig$future = appConfig.future) === null || _appConfig$future === void 0 ? void 0 : _appConfig$future.v3_fetcherPersist) === true
  };
  if (appConfig.future) {
    let userFlags = appConfig.future;
    let deprecatedFlags = ["unstable_cssModules", "unstable_cssSideEffectImports", "unstable_dev", "unstable_postcss", "unstable_tailwind", "unstable_vanillaExtract", "v2_errorBoundary", "v2_headers", "v2_meta", "v2_normalizeFormMethod", "v2_routeConvention"];
    if ("v2_dev" in userFlags) {
      if (userFlags.v2_dev === true) {
        deprecatedFlags.push("v2_dev");
      } else {
        logger.logger.warn("The `v2_dev` future flag is obsolete.", {
          details: ["Move your dev options from `future.v2_dev` to `dev` within your `remix.config.js` file"]
        });
      }
    }
    let obsoleteFlags = deprecatedFlags.filter(f => f in userFlags);
    if (obsoleteFlags.length > 0) {
      logger.logger.warn(`The following Remix future flags are now obsolete ` + `and can be removed from your remix.config.js file:\n` + obsoleteFlags.map(f => `- ${f}\n`).join(""));
    }
  }
  return {
    appDirectory,
    cacheDirectory,
    entryClientFile,
    entryClientFilePath,
    entryServerFile,
    entryServerFilePath,
    dev: appConfig.dev ?? {},
    assetsBuildDirectory: absoluteAssetsBuildDirectory,
    relativeAssetsBuildDirectory: assetsBuildDirectory,
    publicPath,
    rootDirectory,
    routes: routes$1,
    serverBuildPath,
    serverBuildTargetEntryModule,
    serverConditions,
    serverDependenciesToBundle,
    serverEntryPoint,
    serverMainFields,
    serverMinify,
    serverMode,
    serverModuleFormat,
    serverNodeBuiltinsPolyfill,
    browserNodeBuiltinsPolyfill,
    serverPlatform,
    mdx,
    postcss,
    tailwind,
    watchPaths,
    tsconfigPath,
    future
  };
}
function addTrailingSlash(path) {
  return path.endsWith("/") ? path : path + "/";
}
const entryExts = [".js", ".jsx", ".ts", ".tsx"];
function findEntry(dir, basename) {
  for (let ext of entryExts) {
    let file = path__default["default"].resolve(dir, basename + ext);
    if (fse__default["default"].existsSync(file)) return path__default["default"].relative(dir, file);
  }
  return undefined;
}
const configExts = [".js", ".cjs", ".mjs"];
function findConfig(dir, basename, extensions) {
  for (let ext of extensions) {
    let name = basename + ext;
    let file = path__default["default"].join(dir, name);
    if (fse__default["default"].existsSync(file)) return file;
  }
  return undefined;
}

// adds types for `Intl.ListFormat` to the global namespace
// we could also update our `tsconfig.json` to include `lib: ["es2021"]`
let disjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction"
});

exports.findConfig = findConfig;
exports.readConfig = readConfig;
exports.resolveConfig = resolveConfig;
