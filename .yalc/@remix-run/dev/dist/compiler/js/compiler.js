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
var node_module = require('node:module');
var esbuild = require('esbuild');
var dependencies = require('../../dependencies.js');
var loaders = require('../utils/loaders.js');
var routes = require('./plugins/routes.js');
var cssImports = require('../plugins/cssImports.js');
var absoluteCssUrlsPlugin = require('../plugins/absoluteCssUrlsPlugin.js');
var emptyModules = require('../plugins/emptyModules.js');
var mdx = require('../plugins/mdx.js');
var external = require('../plugins/external.js');
var browserNodeBuiltinsPolyfill = require('./plugins/browserNodeBuiltinsPolyfill.js');
var cssBundlePlugin = require('../plugins/cssBundlePlugin.js');
var cssModuleImports = require('../plugins/cssModuleImports.js');
var cssSideEffectImports = require('../plugins/cssSideEffectImports.js');
var vanillaExtract = require('../plugins/vanillaExtract.js');
var invariant = require('../../invariant.js');
var hmr = require('./plugins/hmr.js');
var analysis = require('../analysis.js');

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

const getFakeBuiltins = remixConfig => {
  let dependencies$1 = Object.keys(dependencies.getAppDependencies(remixConfig));
  let fakeBuiltins = node_module.builtinModules.filter(mod => dependencies$1.includes(mod));
  return fakeBuiltins;
};
const createEsbuildConfig = (ctx, refs) => {
  let entryPoints = {
    "entry.client": ctx.config.entryClientFilePath
  };
  for (let id of Object.keys(ctx.config.routes)) {
    entryPoints[id] = ctx.config.routes[id].file;
    // All route entry points are virtual modules that will be loaded by the
    // browserEntryPointsPlugin. This allows us to tree-shake server-only code
    // that we don't want to run in the browser (i.e. action & loader).
    entryPoints[id] += "?browser";
  }
  if (ctx.options.mode === "development") {
    let defaultsDirectory = path__namespace.resolve(__dirname, "..", "..", "config", "defaults");
    entryPoints["__remix_entry_dev"] = path__namespace.join(defaultsDirectory, "entry.dev.ts");
  }
  let fakeBuiltins = getFakeBuiltins(ctx.config);
  if (fakeBuiltins.length > 0) {
    throw new Error(`It appears you're using a module that is built in to Node, but you installed it as a dependency which could cause problems. Please remove ${fakeBuiltins.join(", ")} before continuing.`);
  }
  let plugins = [routes.browserRouteModulesPlugin(ctx, /\?browser$/), cssBundlePlugin.cssBundlePlugin(refs), cssModuleImports.cssModulesPlugin(ctx, {
    outputCss: false
  }), vanillaExtract.vanillaExtractPlugin(ctx, {
    outputCss: false
  }), cssSideEffectImports.cssSideEffectImportsPlugin(ctx, {
    hmr: ctx.options.mode === "development"
  }), cssImports.cssFilePlugin(ctx), absoluteCssUrlsPlugin.absoluteCssUrlsPlugin(), external.externalPlugin(/^https?:\/\//, {
    sideEffects: false
  }), mdx.mdxPlugin(ctx), emptyModules.emptyModulesPlugin(ctx, /\.server(\.[jt]sx?)?$/), emptyModules.emptyModulesPlugin(ctx, /^@remix-run\/(deno|cloudflare|node)(\/.*)?$/, {
    includeNodeModules: true
  }), browserNodeBuiltinsPolyfill.browserNodeBuiltinsPolyfillPlugin(ctx)];
  if (ctx.options.mode === "development") {
    plugins.push(hmr.hmrPlugin(ctx));
  }
  return {
    entryPoints,
    outdir: ctx.config.assetsBuildDirectory,
    platform: "browser",
    format: "esm",
    loader: loaders.loaders,
    bundle: true,
    logLevel: "silent",
    splitting: true,
    sourcemap: ctx.options.sourcemap,
    // As pointed out by https://github.com/evanw/esbuild/issues/2440, when tsconfig is set to
    // `undefined`, esbuild will keep looking for a tsconfig.json recursively up. This unwanted
    // behavior can only be avoided by creating an empty tsconfig file in the root directory.
    tsconfig: ctx.config.tsconfigPath,
    mainFields: ["browser", "module", "main"],
    treeShaking: true,
    minify: ctx.options.mode === "production",
    entryNames: "[dir]/[name]-[hash]",
    chunkNames: "_shared/[name]-[hash]",
    assetNames: "_assets/[name]-[hash]",
    publicPath: ctx.config.publicPath,
    define: {
      "process.env.NODE_ENV": JSON.stringify(ctx.options.mode),
      "process.env.REMIX_DEV_ORIGIN": JSON.stringify(ctx.options.REMIX_DEV_ORIGIN ?? ""),
      ...(ctx.options.mode === "production" ? {
        "import.meta.hot": "undefined"
      } : {})
    },
    jsx: "automatic",
    jsxDev: ctx.options.mode !== "production",
    plugins,
    supported: {
      "import-meta": true
    }
  };
};
const create = async (ctx, refs) => {
  let compiler = await esbuild__namespace.context({
    ...createEsbuildConfig(ctx, refs),
    write: false,
    metafile: true
  });
  let compile = async () => {
    let {
      metafile,
      outputFiles
    } = await compiler.rebuild();
    analysis.writeMetafile(ctx, "metafile.js.json", metafile);
    let hmr = undefined;
    if (ctx.options.mode === "development") {
      var _Object$entries$find;
      let hmrRuntimeOutput = (_Object$entries$find = Object.entries(metafile.outputs).find(([_, output]) => output.inputs["hmr-runtime:remix:hmr"])) === null || _Object$entries$find === void 0 ? void 0 : _Object$entries$find[0];
      invariant["default"](hmrRuntimeOutput, "Expected to find HMR runtime in outputs");
      let hmrRuntime = ctx.config.publicPath + path__namespace.relative(ctx.config.assetsBuildDirectory, path__namespace.resolve(hmrRuntimeOutput));
      hmr = {
        runtime: hmrRuntime,
        timestamp: Date.now()
      };
    }
    return {
      metafile,
      hmr,
      outputFiles
    };
  };
  return {
    compile,
    cancel: compiler.cancel,
    dispose: compiler.dispose
  };
};

exports.create = create;
