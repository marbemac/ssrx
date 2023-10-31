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

var node_module = require('node:module');
var esbuild = require('esbuild');
var loaders = require('../utils/loaders.js');
var cssImports = require('../plugins/cssImports.js');
var absoluteCssUrlsPlugin = require('../plugins/absoluteCssUrlsPlugin.js');
var emptyModules = require('../plugins/emptyModules.js');
var mdx = require('../plugins/mdx.js');
var external = require('../plugins/external.js');
var cssModuleImports = require('../plugins/cssModuleImports.js');
var cssSideEffectImports = require('../plugins/cssSideEffectImports.js');
var vanillaExtract = require('../plugins/vanillaExtract.js');
var bundleEntry = require('./plugins/bundleEntry.js');
var bundle = require('./bundle.js');
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

const createEsbuildConfig = ctx => {
  return {
    entryPoints: {
      "css-bundle": bundleEntry.cssBundleEntryModuleId
    },
    outdir: ctx.config.assetsBuildDirectory,
    platform: "browser",
    format: "esm",
    // Node built-ins (and any polyfills) are guaranteed to never contain CSS,
    // and the JS from this build will never be executed, so we can safely skip
    // bundling them and leave any imports of them as-is in the generated JS.
    // Any issues with Node built-ins will be caught by the browser JS build.
    external: node_module.builtinModules,
    loader: loaders.loaders,
    bundle: true,
    logLevel: "silent",
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
      "process.env.NODE_ENV": JSON.stringify(ctx.options.mode)
    },
    jsx: "automatic",
    jsxDev: ctx.options.mode !== "production",
    plugins: [bundleEntry.cssBundleEntryModulePlugin(ctx), cssModuleImports.cssModulesPlugin(ctx, {
      outputCss: true
    }), vanillaExtract.vanillaExtractPlugin(ctx, {
      outputCss: true
    }), cssSideEffectImports.cssSideEffectImportsPlugin(ctx), cssImports.cssFilePlugin(ctx), absoluteCssUrlsPlugin.absoluteCssUrlsPlugin(), external.externalPlugin(/^https?:\/\//, {
      sideEffects: false
    }), mdx.mdxPlugin(ctx),
    // Skip compilation of common packages/scopes known not to include CSS imports
    emptyModules.emptyModulesPlugin(ctx, /^(@remix-run|react|react-dom)(\/.*)?$/, {
      includeNodeModules: true
    }), emptyModules.emptyModulesPlugin(ctx, /\.server(\.[jt]sx?)?$/), external.externalPlugin(/^node:.*/, {
      sideEffects: false
    })],
    supported: {
      "import-meta": true
    }
  };
};
let create = async ctx => {
  let compiler = await esbuild__namespace.context({
    ...createEsbuildConfig(ctx),
    write: false,
    metafile: true
  });
  let compile = async () => {
    let {
      outputFiles,
      metafile
    } = await compiler.rebuild();
    analysis.writeMetafile(ctx, "metafile.css.json", metafile);
    let bundleOutputFile = outputFiles.find(outputFile => bundle.isBundle(ctx, outputFile, ".css"));
    return {
      bundleOutputFile,
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
