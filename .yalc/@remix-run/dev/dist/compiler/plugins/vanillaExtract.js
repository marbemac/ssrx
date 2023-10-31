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
var integration = require('@vanilla-extract/integration');
var loaders = require('../utils/loaders.js');
var postcss = require('../utils/postcss.js');
var dependencies = require('../../dependencies.js');

const pluginName = "vanilla-extract-plugin";
const namespace = `${pluginName}-ns`;
const virtualCssFileFilter = /\.vanilla.css$/;
const staticAssetRegexp = new RegExp(`(${Object.keys(loaders.loaders).filter(ext => ext !== ".css" && loaders.loaders[ext] === "file").join("|")})$`);
let compiler;
function getCompiler(root, mode) {
  compiler = compiler || integration.createCompiler({
    root,
    identifiers: mode === "production" ? "short" : "debug",
    vitePlugins: [{
      name: "remix-assets",
      enforce: "pre",
      async resolveId(source) {
        // Handle root-relative imports within Vanilla Extract files
        if (source.startsWith("~")) {
          return await this.resolve(source.replace("~", ""));
        }
        // Handle static asset JS imports
        if (source.startsWith("/") && staticAssetRegexp.test(source)) {
          return {
            external: true,
            id: "~" + source
          };
        }
      },
      transform(code) {
        // Translate Vite's fs import format for root-relative imports
        return code.replace(/\/@fs\/~\//g, "~/");
      }
    }]
  });
  return compiler;
}
function vanillaExtractPlugin({
  config,
  options
}, {
  outputCss
}) {
  return {
    name: pluginName,
    async setup(build) {
      let appDependencies = dependencies.getAppDependencies(config, true);
      if (!appDependencies["@vanilla-extract/css"]) {
        return;
      }
      let root = config.appDirectory;

      // Resolve virtual CSS files first to avoid resolving the same
      // file multiple times since this filter is more specific and
      // doesn't require a file system lookup.
      build.onResolve({
        filter: virtualCssFileFilter
      }, args => {
        return {
          path: args.path,
          namespace
        };
      });

      // Mark all .css.ts/js files as having side effects. This is to ensure
      // that all usages of `globalStyle` are included in the CSS bundle, even
      // if a .css.ts/js file has no exports or is otherwise tree-shaken.
      let preventInfiniteLoop = {};
      build.onResolve({
        filter: /\.css(\.(j|t)sx?)?(\?.*)?$/,
        namespace: "file"
      }, async args => {
        if (args.pluginData === preventInfiniteLoop) {
          return null;
        }
        let resolvedPath = (await build.resolve(args.path, {
          resolveDir: args.resolveDir,
          kind: args.kind,
          pluginData: preventInfiniteLoop
        })).path;
        if (!integration.cssFileFilter.test(resolvedPath)) {
          return null;
        }
        return {
          path: resolvedPath,
          sideEffects: true
        };
      });
      build.onLoad({
        filter: virtualCssFileFilter,
        namespace
      }, async ({
        path: path$1
      }) => {
        let [relativeFilePath] = path$1.split(".vanilla.css");
        let compiler = getCompiler(root, options.mode);
        let {
          css,
          filePath
        } = compiler.getCssForFile(relativeFilePath);
        let resolveDir = path.dirname(path.resolve(root, filePath));
        let postcssProcessor = await postcss.getPostcssProcessor({
          config,
          postcssContext: {
            vanillaExtract: true
          }
        });
        if (postcssProcessor) {
          css = (await postcssProcessor.process(css, {
            from: path$1,
            to: path$1
          })).css;
        }
        return {
          contents: css,
          loader: "css",
          resolveDir
        };
      });
      build.onLoad({
        filter: integration.cssFileFilter
      }, async ({
        path: filePath
      }) => {
        let compiler = getCompiler(root, options.mode);
        let {
          source,
          watchFiles
        } = await compiler.processVanillaFile(filePath, {
          outputCss
        });
        return {
          contents: source,
          resolveDir: path.dirname(filePath),
          loader: "js",
          watchFiles: (Array.from(watchFiles) || []).map(watchFile => watchFile.startsWith("~") ? path.resolve(root, watchFile.replace("~", ".")) : watchFile)
        };
      });
    }
  };
}

exports.vanillaExtractPlugin = vanillaExtractPlugin;
