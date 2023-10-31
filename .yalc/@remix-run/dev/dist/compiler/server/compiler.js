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

var esbuild = require('esbuild');
var loaders = require('../utils/loaders.js');
var cssModuleImports = require('../plugins/cssModuleImports.js');
var cssSideEffectImports = require('../plugins/cssSideEffectImports.js');
var vanillaExtract = require('../plugins/vanillaExtract.js');
var cssImports = require('../plugins/cssImports.js');
var absoluteCssUrlsPlugin = require('../plugins/absoluteCssUrlsPlugin.js');
var emptyModules = require('../plugins/emptyModules.js');
var serverNodeBuiltinsPolyfill = require('./plugins/serverNodeBuiltinsPolyfill.js');
var mdx = require('../plugins/mdx.js');
var manifest = require('./plugins/manifest.js');
var bareImports = require('./plugins/bareImports.js');
var entry = require('./plugins/entry.js');
var routes = require('./plugins/routes.js');
var external = require('../plugins/external.js');
var cssBundlePlugin = require('../plugins/cssBundlePlugin.js');
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

var esbuild__namespace = /*#__PURE__*/_interopNamespace(esbuild);

const createEsbuildConfig = (ctx, refs) => {
  let stdin;
  let entryPoints;
  if (ctx.config.serverEntryPoint) {
    entryPoints = [ctx.config.serverEntryPoint];
  } else {
    stdin = {
      contents: ctx.config.serverBuildTargetEntryModule,
      resolveDir: ctx.config.rootDirectory,
      loader: "ts"
    };
  }
  let plugins = [cssBundlePlugin.cssBundlePlugin(refs), cssModuleImports.cssModulesPlugin(ctx, {
    outputCss: false
  }), vanillaExtract.vanillaExtractPlugin(ctx, {
    outputCss: false
  }), cssSideEffectImports.cssSideEffectImportsPlugin(ctx), cssImports.cssFilePlugin(ctx), absoluteCssUrlsPlugin.absoluteCssUrlsPlugin(), external.externalPlugin(/^https?:\/\//, {
    sideEffects: false
  }), mdx.mdxPlugin(ctx), emptyModules.emptyModulesPlugin(ctx, /\.client(\.[jt]sx?)?$/), routes.serverRouteModulesPlugin(ctx), entry.serverEntryModulePlugin(ctx), manifest.serverAssetsManifestPlugin(refs), bareImports.serverBareModulesPlugin(ctx), external.externalPlugin(/^node:.*/, {
    sideEffects: false
  })];
  if (ctx.config.serverNodeBuiltinsPolyfill) {
    plugins.unshift(serverNodeBuiltinsPolyfill.serverNodeBuiltinsPolyfillPlugin(ctx));
  }
  return {
    absWorkingDir: ctx.config.rootDirectory,
    stdin,
    entryPoints,
    outfile: ctx.config.serverBuildPath,
    conditions: ctx.config.serverConditions,
    platform: ctx.config.serverPlatform,
    format: ctx.config.serverModuleFormat,
    treeShaking: true,
    // The type of dead code elimination we want to do depends on the
    // minify syntax property: https://github.com/evanw/esbuild/issues/672#issuecomment-1029682369
    // Dev builds are leaving code that should be optimized away in the
    // bundle causing server / testing code to be shipped to the browser.
    // These are properly optimized away in prod builds today, and this
    // PR makes dev mode behave closer to production in terms of dead
    // code elimination / tree shaking is concerned.
    minifySyntax: true,
    minify: ctx.options.mode === "production" && ctx.config.serverMinify,
    mainFields: ctx.config.serverMainFields,
    target: "node18",
    loader: loaders.loaders,
    bundle: true,
    logLevel: "silent",
    // As pointed out by https://github.com/evanw/esbuild/issues/2440, when tsconfig is set to
    // `undefined`, esbuild will keep looking for a tsconfig.json recursively up. This unwanted
    // behavior can only be avoided by creating an empty tsconfig file in the root directory.
    tsconfig: ctx.config.tsconfigPath,
    sourcemap: ctx.options.sourcemap,
    // use linked (true) to fix up .map file
    // The server build needs to know how to generate asset URLs for imports
    // of CSS and other files.
    assetNames: "_assets/[name]-[hash]",
    publicPath: ctx.config.publicPath,
    define: {
      "process.env.NODE_ENV": JSON.stringify(ctx.options.mode),
      "process.env.REMIX_DEV_ORIGIN": JSON.stringify(ctx.options.REMIX_DEV_ORIGIN ?? "")
    },
    jsx: "automatic",
    jsxDev: ctx.options.mode !== "production",
    plugins
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
      outputFiles,
      metafile
    } = await compiler.rebuild();
    analysis.writeMetafile(ctx, "metafile.server.json", metafile);
    return outputFiles;
  };
  return {
    compile,
    cancel: compiler.cancel,
    dispose: compiler.dispose
  };
};

exports.create = create;
