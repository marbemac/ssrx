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

var node_crypto = require('node:crypto');
var path = require('node:path');
var fs = require('node:fs/promises');
var babel = require('@babel/core');
var vite = require('vite');
var esModuleLexer = require('es-module-lexer');
var jsesc = require('jsesc');
var pick = require('lodash/pick');
var pc = require('picocolors');
var config = require('../config.js');
var adapter = require('./node/adapter.js');
var styles = require('./styles.js');
var vmod = require('./vmod.js');
var removeExports = require('./remove-exports.js');
var legacyCssImports = require('./legacy-css-imports.js');
var replaceImportSpecifier = require('./replace-import-specifier.js');

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
var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var babel__default = /*#__PURE__*/_interopDefaultLegacy(babel);
var jsesc__default = /*#__PURE__*/_interopDefaultLegacy(jsesc);
var pick__default = /*#__PURE__*/_interopDefaultLegacy(pick);
var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);

const supportedRemixConfigKeys = ["appDirectory", "assetsBuildDirectory", "future", "ignoredRouteFiles", "publicPath", "routes", "serverBuildPath", "serverModuleFormat"];
let serverEntryId = vmod.id("server-entry");
let serverManifestId = vmod.id("server-manifest");
let browserManifestId = vmod.id("browser-manifest");
let remixReactProxyId = vmod.id("remix-react-proxy");
let hmrRuntimeId = vmod.id("hmr-runtime");
const normalizePath = p => {
  let unixPath = p.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");
  return vite.normalizePath(unixPath);
};
const resolveFileUrl = ({
  rootDirectory
}, filePath) => {
  let relativePath = path__namespace.relative(rootDirectory, filePath);
  if (relativePath.startsWith("..") || path__namespace.isAbsolute(relativePath)) {
    throw new Error(`Cannot resolve asset path "${filePath}" outside of root directory "${rootDirectory}".`);
  }
  return `/${normalizePath(relativePath)}`;
};
const isJsFile = filePath => /\.[cm]?[jt]sx?$/i.test(filePath);
const resolveRelativeRouteFilePath = (route, pluginConfig) => {
  let file = route.file;
  let fullPath = path__namespace.resolve(pluginConfig.appDirectory, file);
  return normalizePath(fullPath);
};
let vmods = [serverEntryId, serverManifestId, browserManifestId];
const getHash = (source, maxLength) => {
  let hash = node_crypto.createHash("sha256").update(source).digest("hex");
  return typeof maxLength === "number" ? hash.slice(0, maxLength) : hash;
};
const resolveBuildAssetPaths = (pluginConfig, manifest, absoluteFilePath) => {
  var _manifestEntry$import, _manifestEntry$css;
  let rootRelativeFilePath = path__namespace.relative(pluginConfig.rootDirectory, absoluteFilePath);
  let manifestKey = normalizePath(rootRelativeFilePath);
  let manifestEntry = manifest[manifestKey];
  if (!manifestEntry) {
    let knownManifestKeys = Object.keys(manifest).map(key => '"' + key + '"').join(", ");
    throw new Error(`No manifest entry found for "${manifestKey}". Known manifest keys: ${knownManifestKeys}`);
  }
  return {
    module: `${pluginConfig.publicPath}${manifestEntry.file}`,
    imports: ((_manifestEntry$import = manifestEntry.imports) === null || _manifestEntry$import === void 0 ? void 0 : _manifestEntry$import.map(imported => {
      return `${pluginConfig.publicPath}${manifest[imported].file}`;
    })) ?? [],
    css: ((_manifestEntry$css = manifestEntry.css) === null || _manifestEntry$css === void 0 ? void 0 : _manifestEntry$css.map(href => {
      return `${pluginConfig.publicPath}${href}`;
    })) ?? []
  };
};
const writeFileSafe = async (file, contents) => {
  await fs__namespace.mkdir(path__namespace.dirname(file), {
    recursive: true
  });
  await fs__namespace.writeFile(file, contents);
};
const getRouteModuleExports = async (viteChildCompiler, pluginConfig, routeFile) => {
  if (!viteChildCompiler) {
    throw new Error("Vite child compiler not found");
  }

  // We transform the route module code with the Vite child compiler so that we
  // can parse the exports from non-JS files like MDX. This ensures that we can
  // understand the exports from anything that Vite can compile to JS, not just
  // the route file formats that the Remix compiler historically supported.

  let ssr = true;
  let {
    pluginContainer,
    moduleGraph
  } = viteChildCompiler;
  let routePath = path__namespace.join(pluginConfig.appDirectory, routeFile);
  let url = resolveFileUrl(pluginConfig, routePath);
  let resolveId = async () => {
    let result = await pluginContainer.resolveId(url, undefined, {
      ssr
    });
    if (!result) throw new Error(`Could not resolve module ID for ${url}`);
    return result.id;
  };
  let [id, code] = await Promise.all([resolveId(), fs__namespace.readFile(routePath, "utf-8"),
  // pluginContainer.transform(...) fails if we don't do this first:
  moduleGraph.ensureEntryFromUrl(url, ssr)]);
  let transformed = await pluginContainer.transform(code, id, {
    ssr
  });
  let [, exports] = esModuleLexer.parse(transformed.code);
  let exportNames = exports.map(e => e.n);
  return exportNames;
};
const showUnstableWarning = () => {
  console.warn(pc__default["default"].yellow("\n  ⚠️  Remix support for Vite is unstable\n     and not recommended for production\n"));
};
const getViteMajor = () => {
  let vitePkg = require("vite/package.json");
  return parseInt(vitePkg.version.split(".")[0]);
};
const remixVitePlugin = (options = {}) => {
  let isViteGTEv5 = getViteMajor() >= 5;
  let viteCommand;
  let viteUserConfig;
  let cssModulesManifest = {};
  let ssrBuildContext;
  let viteChildCompiler = null;
  let resolvePluginConfig = async () => {
    var _options$future;
    let rootDirectory = viteUserConfig.root ?? process.env.REMIX_ROOT ?? process.cwd();

    // Avoid leaking any config options that the Vite plugin doesn't support
    let config$1 = pick__default["default"](options, supportedRemixConfigKeys);

    // Only select the Remix config options that the Vite plugin uses
    let {
      appDirectory,
      assetsBuildDirectory,
      entryClientFilePath,
      publicPath,
      routes,
      entryServerFilePath,
      serverBuildPath,
      serverModuleFormat,
      relativeAssetsBuildDirectory
    } = await config.resolveConfig(config$1, {
      rootDirectory
    });
    return {
      appDirectory,
      rootDirectory,
      assetsBuildDirectory,
      entryClientFilePath,
      publicPath,
      routes,
      entryServerFilePath,
      serverBuildPath,
      serverModuleFormat,
      relativeAssetsBuildDirectory,
      future: {
        v3_fetcherPersist: ((_options$future = options.future) === null || _options$future === void 0 ? void 0 : _options$future.v3_fetcherPersist) === true
      }
    };
  };
  let getServerEntry = async () => {
    let pluginConfig = await resolvePluginConfig();
    return `
    import * as entryServer from ${JSON.stringify(resolveFileUrl(pluginConfig, pluginConfig.entryServerFilePath))};
    ${Object.keys(pluginConfig.routes).map((key, index) => {
      let route = pluginConfig.routes[key];
      return `import * as route${index} from ${JSON.stringify(resolveFileUrl(pluginConfig, resolveRelativeRouteFilePath(route, pluginConfig)))};`;
    }).join("\n")}
      export { default as assets } from ${JSON.stringify(serverManifestId)};
      export const assetsBuildDirectory = ${JSON.stringify(pluginConfig.relativeAssetsBuildDirectory)};
      ${pluginConfig.future ? `export const future = ${JSON.stringify(pluginConfig.future)}` : ""};
      export const publicPath = ${JSON.stringify(pluginConfig.publicPath)};
      export const entry = { module: entryServer };
      export const routes = {
        ${Object.keys(pluginConfig.routes).map((key, index) => {
      let route = pluginConfig.routes[key];
      return `${JSON.stringify(key)}: {
          id: ${JSON.stringify(route.id)},
          parentId: ${JSON.stringify(route.parentId)},
          path: ${JSON.stringify(route.path)},
          index: ${JSON.stringify(route.index)},
          caseSensitive: ${JSON.stringify(route.caseSensitive)},
          module: route${index}
        }`;
    }).join(",\n  ")}
      };`;
  };
  let createBuildManifest = async () => {
    let pluginConfig = await resolvePluginConfig();
    let viteManifestPath = isViteGTEv5 ? path__namespace.join(".vite", "manifest.json") : "manifest.json";
    let viteManifest = JSON.parse(await fs__namespace.readFile(path__namespace.resolve(pluginConfig.assetsBuildDirectory, viteManifestPath), "utf-8"));
    let entry = resolveBuildAssetPaths(pluginConfig, viteManifest, pluginConfig.entryClientFilePath);
    let routes = {};
    for (let [key, route] of Object.entries(pluginConfig.routes)) {
      let routeFilePath = path__namespace.join(pluginConfig.appDirectory, route.file);
      let sourceExports = await getRouteModuleExports(viteChildCompiler, pluginConfig, route.file);
      routes[key] = {
        id: route.id,
        parentId: route.parentId,
        path: route.path,
        index: route.index,
        caseSensitive: route.caseSensitive,
        hasAction: sourceExports.includes("action"),
        hasLoader: sourceExports.includes("loader"),
        hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
        ...resolveBuildAssetPaths(pluginConfig, viteManifest, routeFilePath)
      };
    }
    let fingerprintedValues = {
      entry,
      routes
    };
    let version = getHash(JSON.stringify(fingerprintedValues), 8);
    let manifestFilename = `manifest-${version}.js`;
    let url = `${pluginConfig.publicPath}${manifestFilename}`;
    let nonFingerprintedValues = {
      url,
      version
    };
    let manifest = {
      ...fingerprintedValues,
      ...nonFingerprintedValues
    };
    await writeFileSafe(path__namespace.join(pluginConfig.assetsBuildDirectory, manifestFilename), `window.__remixManifest=${JSON.stringify(manifest)};`);
    return manifest;
  };
  let getDevManifest = async () => {
    let pluginConfig = await resolvePluginConfig();
    let routes = {};
    for (let [key, route] of Object.entries(pluginConfig.routes)) {
      let sourceExports = await getRouteModuleExports(viteChildCompiler, pluginConfig, route.file);
      routes[key] = {
        id: route.id,
        parentId: route.parentId,
        path: route.path,
        index: route.index,
        caseSensitive: route.caseSensitive,
        module: `${resolveFileUrl(pluginConfig, resolveRelativeRouteFilePath(route, pluginConfig))}${isJsFile(route.file) ? "" : "?import" // Ensure the Vite dev server responds with a JS module
        }`,
        hasAction: sourceExports.includes("action"),
        hasLoader: sourceExports.includes("loader"),
        hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
        imports: []
      };
    }
    return {
      version: String(Math.random()),
      url: vmod.url(browserManifestId),
      entry: {
        module: resolveFileUrl(pluginConfig, pluginConfig.entryClientFilePath),
        imports: []
      },
      routes
    };
  };
  return [{
    name: "remix",
    config: async (_viteUserConfig, viteConfigEnv) => {
      var _viteUserConfig$build, _viteUserConfig$build2;
      viteUserConfig = _viteUserConfig;
      viteCommand = viteConfigEnv.command;
      let pluginConfig = await resolvePluginConfig();
      return {
        appType: "custom",
        experimental: {
          hmrPartialAccept: true
        },
        optimizeDeps: {
          include: [
          // pre-bundle React dependencies to avoid React duplicates,
          // even if React dependencies are not direct dependencies
          // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
          "react", `react/jsx-runtime`, `react/jsx-dev-runtime`, "react-dom/client"]
        },
        resolve: {
          // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
          dedupe: ["react", "react-dom"]
        },
        ...(viteCommand === "build" && {
          base: pluginConfig.publicPath,
          build: {
            ...viteUserConfig.build,
            ...(!viteConfigEnv.ssrBuild ? {
              manifest: true,
              outDir: pluginConfig.assetsBuildDirectory,
              rollupOptions: {
                ...((_viteUserConfig$build = viteUserConfig.build) === null || _viteUserConfig$build === void 0 ? void 0 : _viteUserConfig$build.rollupOptions),
                preserveEntrySignatures: "exports-only",
                input: [pluginConfig.entryClientFilePath, ...Object.values(pluginConfig.routes).map(route => path__namespace.resolve(pluginConfig.appDirectory, route.file))]
              }
            } : {
              outDir: path__namespace.dirname(pluginConfig.serverBuildPath),
              rollupOptions: {
                ...((_viteUserConfig$build2 = viteUserConfig.build) === null || _viteUserConfig$build2 === void 0 ? void 0 : _viteUserConfig$build2.rollupOptions),
                preserveEntrySignatures: "exports-only",
                input: serverEntryId,
                output: {
                  entryFileNames: path__namespace.basename(pluginConfig.serverBuildPath),
                  format: pluginConfig.serverModuleFormat
                }
              }
            })
          }
        })
      };
    },
    async configResolved(viteConfig) {
      await esModuleLexer.init;
      viteChildCompiler = await vite.createServer({
        ...viteUserConfig,
        server: {
          ...viteUserConfig.server,
          // when parent compiler runs in middleware mode to support
          // custom servers, we don't want the child compiler also
          // run in middleware mode as that will cause websocket port conflicts
          middlewareMode: false
        },
        configFile: false,
        envFile: false,
        plugins: [...(viteUserConfig.plugins ?? []).flat()
        // Exclude this plugin from the child compiler to prevent an
        // infinite loop (plugin creates a child compiler with the same
        // plugin that creates another child compiler, repeat ad
        // infinitum), and to prevent the manifest from being written to
        // disk from the child compiler. This is important in the
        // production build because the child compiler is a Vite dev
        // server and will generate incorrect manifests.
        .filter(plugin => typeof plugin === "object" && plugin !== null && "name" in plugin && plugin.name !== "remix" && plugin.name !== "remix-hmr-updates"), {
          name: "no-hmr",
          handleHotUpdate() {
            // parent vite server is already sending HMR updates
            // do not send duplicate HMR updates from child server
            // which log confusing "page reloaded" messages that aren't true
            return [];
          }
        }]
      });
      await viteChildCompiler.pluginContainer.buildStart({});
      ssrBuildContext = viteConfig.build.ssr && viteCommand === "build" ? {
        isSsrBuild: true,
        getManifest: createBuildManifest
      } : {
        isSsrBuild: false
      };
    },
    transform(code, id) {
      if (styles.isCssModulesFile(id)) {
        cssModulesManifest[id] = code;
      }
    },
    buildStart() {
      if (viteCommand === "build") {
        showUnstableWarning();
      }
    },
    configureServer(vite) {
      var _vite$httpServer;
      (_vite$httpServer = vite.httpServer) === null || _vite$httpServer === void 0 ? void 0 : _vite$httpServer.on("listening", () => {
        setTimeout(showUnstableWarning, 50);
      });
      // Let user servers handle SSR requests in middleware mode
      if (vite.config.server.middlewareMode) return;
      return () => {
        vite.middlewares.use(async (req, res, next) => {
          try {
            // Invalidate all virtual modules
            vmods.forEach(vmod$1 => {
              let mod = vite.moduleGraph.getModuleById(vmod.resolve(vmod$1));
              if (mod) {
                vite.moduleGraph.invalidateModule(mod);
              }
            });
            let {
              url
            } = req;
            let [pluginConfig, build] = await Promise.all([resolvePluginConfig(), vite.ssrLoadModule(serverEntryId)]);
            let handle = adapter.createRequestHandler(build, {
              mode: "development",
              criticalCss: await styles.getStylesForUrl(vite, pluginConfig, cssModulesManifest, build, url)
            });
            await handle(req, res);
          } catch (error) {
            next(error);
          }
        });
      };
    },
    async buildEnd() {
      var _viteChildCompiler;
      await ((_viteChildCompiler = viteChildCompiler) === null || _viteChildCompiler === void 0 ? void 0 : _viteChildCompiler.close());
    }
  }, {
    name: "remix-virtual-modules",
    enforce: "pre",
    resolveId(id) {
      if (vmods.includes(id)) return vmod.resolve(id);
    },
    async load(id) {
      switch (id) {
        case vmod.resolve(serverEntryId):
          {
            return await getServerEntry();
          }
        case vmod.resolve(serverManifestId):
          {
            let manifest = ssrBuildContext.isSsrBuild ? await ssrBuildContext.getManifest() : await getDevManifest();
            return `export default ${jsesc__default["default"](manifest, {
              es6: true
            })};`;
          }
        case vmod.resolve(browserManifestId):
          {
            if (viteCommand === "build") {
              throw new Error("This module only exists in development");
            }
            let manifest = await getDevManifest();
            return `window.__remixManifest=${jsesc__default["default"](manifest, {
              es6: true
            })};`;
          }
      }
    }
  }, {
    name: "remix-empty-server-modules",
    enforce: "pre",
    async transform(_code, id, options) {
      if (!(options !== null && options !== void 0 && options.ssr) && /\.server(\.[cm]?[jt]sx?)?$/.test(id)) return {
        code: "export default {}",
        map: null
      };
    }
  }, {
    name: "remix-empty-client-modules",
    enforce: "pre",
    async transform(_code, id, options) {
      if (options !== null && options !== void 0 && options.ssr && /\.client(\.[cm]?[jt]sx?)?$/.test(id)) return {
        code: "export default {}",
        map: null
      };
    }
  }, {
    name: "remix-remove-server-exports",
    enforce: "post",
    // Ensure we're operating on the transformed code to support MDX etc.
    async transform(code, id, options) {
      if (options !== null && options !== void 0 && options.ssr) return;
      let pluginConfig = await resolvePluginConfig();
      let route = getRoute(pluginConfig, id);
      if (!route) return;
      let serverExports = ["loader", "action", "headers"];
      return {
        code: removeExports.removeExports(code, serverExports),
        map: null
      };
    }
  }, {
    name: "remix-remix-react-proxy",
    enforce: "post",
    // Ensure we're operating on the transformed code to support MDX etc.
    resolveId(id) {
      if (id === remixReactProxyId) {
        return vmod.resolve(remixReactProxyId);
      }
    },
    transform(code, id) {
      // Don't transform the proxy itself, otherwise it will import itself
      if (id === vmod.resolve(remixReactProxyId)) {
        return;
      }

      // Don't transform files that don't need the proxy
      if (!code.includes("@remix-run/react") && !code.includes("LiveReload")) {
        return;
      }

      // Rewrite imports to use the proxy
      return replaceImportSpecifier.replaceImportSpecifier({
        code,
        specifier: "@remix-run/react",
        replaceWith: remixReactProxyId
      });
    },
    load(id) {
      if (id === vmod.resolve(remixReactProxyId)) {
        // TODO: ensure react refresh is initialized before `<Scripts />`
        return ['import { createElement } from "react";', 'export * from "@remix-run/react";', 'export const LiveReload = process.env.NODE_ENV !== "development" ? () => null : ', '() => createElement("script", {', ' type: "module",', " async: true,", " suppressHydrationWarning: true,", " dangerouslySetInnerHTML: { __html: `", `   import RefreshRuntime from "${vmod.url(hmrRuntimeId)}"`, "   RefreshRuntime.injectIntoGlobalHook(window)", "   window.$RefreshReg$ = () => {}", "   window.$RefreshSig$ = () => (type) => type", "   window.__vite_plugin_react_preamble_installed__ = true", " `}", "});"].join("\n");
      }
    }
  }, {
    name: "remix-hmr-runtime",
    enforce: "pre",
    resolveId(id) {
      if (id === hmrRuntimeId) return vmod.resolve(hmrRuntimeId);
    },
    async load(id) {
      if (id !== vmod.resolve(hmrRuntimeId)) return;
      let reactRefreshDir = path__namespace.dirname(require.resolve("react-refresh/package.json"));
      let reactRefreshRuntimePath = path__namespace.join(reactRefreshDir, "cjs/react-refresh-runtime.development.js");
      return ["const exports = {}", await fs__namespace.readFile(reactRefreshRuntimePath, "utf8"), await fs__namespace.readFile(require.resolve("./static/refresh-utils.cjs"), "utf8"), "export default exports"].join("\n");
    }
  }, {
    name: "remix-react-refresh-babel",
    enforce: "post",
    async transform(code, id, options) {
      if (viteCommand !== "serve") return;
      if (id.includes("/node_modules/")) return;
      let [filepath] = id.split("?");
      if (!/.[tj]sx?$/.test(filepath)) return;
      let devRuntime = "react/jsx-dev-runtime";
      let ssr = (options === null || options === void 0 ? void 0 : options.ssr) === true;
      let isJSX = filepath.endsWith("x");
      let useFastRefresh = !ssr && (isJSX || code.includes(devRuntime));
      if (!useFastRefresh) return;
      let result = await babel__default["default"].transformAsync(code, {
        filename: id,
        sourceFileName: filepath,
        parserOpts: {
          sourceType: "module",
          allowAwaitOutsideFunction: true,
          plugins: ["jsx", "typescript"]
        },
        plugins: ["react-refresh/babel"],
        sourceMaps: true
      });
      if (result === null) return;
      code = result.code;
      let refreshContentRE = /\$Refresh(?:Reg|Sig)\$\(/;
      if (refreshContentRE.test(code)) {
        let pluginConfig = await resolvePluginConfig();
        code = addRefreshWrapper(pluginConfig, code, id);
      }
      return {
        code,
        map: result.map
      };
    }
  }, {
    name: "remix-hmr-updates",
    async handleHotUpdate({
      server,
      file,
      modules
    }) {
      let pluginConfig = await resolvePluginConfig();
      let route = getRoute(pluginConfig, file);
      server.ws.send({
        type: "custom",
        event: "remix:hmr",
        data: {
          route: route ? await getRouteMetadata(pluginConfig, viteChildCompiler, route) : null
        }
      });
      return modules;
    }
  }, ...(options.legacyCssImports ? [{
    name: "remix-legacy-css-imports",
    enforce: "pre",
    transform(code) {
      if (code.includes('.css"') || code.includes(".css'")) {
        return legacyCssImports.transformLegacyCssImports(code);
      }
    }
  }] : [])];
};
function addRefreshWrapper(pluginConfig, code, id) {
  let isRoute = getRoute(pluginConfig, id);
  let acceptExports = isRoute ? ["meta", "links", "shouldRevalidate"] : [];
  return REACT_REFRESH_HEADER.replace("__SOURCE__", JSON.stringify(id)) + code + REACT_REFRESH_FOOTER.replace("__SOURCE__", JSON.stringify(id)).replace("__ACCEPT_EXPORTS__", JSON.stringify(acceptExports));
}
const REACT_REFRESH_HEADER = `
import RefreshRuntime from "${hmrRuntimeId}";

const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;

if (import.meta.hot && !inWebWorker) {
  if (!window.__vite_plugin_react_preamble_installed__) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong. " +
      "See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
    );
  }

  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, __SOURCE__ + " " + id)
  };
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}`.replace(/\n+/g, "");
const REACT_REFRESH_FOOTER = `
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh(__SOURCE__, currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate(currentExports, nextExports, __ACCEPT_EXPORTS__);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}`;
function getRoute(pluginConfig, file) {
  if (!file.startsWith(vite.normalizePath(pluginConfig.appDirectory))) return;
  let routePath = vite.normalizePath(path__namespace.relative(pluginConfig.appDirectory, file));
  let route = Object.values(pluginConfig.routes).find(r => r.file === routePath);
  return route;
}
async function getRouteMetadata(pluginConfig, viteChildCompiler, route) {
  let sourceExports = await getRouteModuleExports(viteChildCompiler, pluginConfig, route.file);
  let info = {
    id: route.id,
    parentId: route.parentId,
    path: route.path,
    index: route.index,
    caseSensitive: route.caseSensitive,
    url: "/" + path__namespace.relative(pluginConfig.rootDirectory, resolveRelativeRouteFilePath(route, pluginConfig)),
    module: `${resolveFileUrl(pluginConfig, resolveRelativeRouteFilePath(route, pluginConfig))}?import`,
    // Ensure the Vite dev server responds with a JS module
    hasAction: sourceExports.includes("action"),
    hasLoader: sourceExports.includes("loader"),
    hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
    imports: []
  };
  return info;
}

exports.remixVitePlugin = remixVitePlugin;
