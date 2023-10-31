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
var fse = require('fs-extra');
var postcss$1 = require('postcss');
var postcssModules = require('postcss-modules');
var postcss = require('../utils/postcss.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss$1);
var postcssModules__default = /*#__PURE__*/_interopDefaultLegacy(postcssModules);

const pluginName = "css-modules-plugin";
const namespace = `${pluginName}-ns`;
const cssModulesFilter = /\.module\.css$/;
const compiledCssQuery = "?css-modules-plugin-compiled-css";
const compiledCssFilter = /\?css-modules-plugin-compiled-css$/;
const cssModulesPlugin = ({
  config,
  options,
  fileWatchCache
}, {
  outputCss
}) => {
  return {
    name: pluginName,
    setup: async build => {
      build.onResolve({
        filter: cssModulesFilter,
        namespace: "file"
      }, async args => {
        let resolvedPath = (await build.resolve(args.path, {
          resolveDir: args.resolveDir,
          kind: args.kind
        })).path;
        return {
          path: resolvedPath
        };
      });
      build.onLoad({
        filter: cssModulesFilter
      }, async args => {
        let {
          path: absolutePath
        } = args;
        let resolveDir = path__default["default"].dirname(absolutePath);
        let cacheKey = `css-module:${absolutePath}?mode=${options.mode}`;
        let {
          cacheValue
        } = await fileWatchCache.getOrSet(cacheKey, async () => {
          let fileContents = await fse__default["default"].readFile(absolutePath, "utf8");
          let exports = {};
          let fileDependencies = new Set([absolutePath]);
          let globDependencies = new Set();
          let postcssPlugins = await postcss.loadPostcssPlugins({
            config
          });
          let {
            css: compiledCss,
            messages
          } = await postcss__default["default"]([...postcssPlugins, postcssModules__default["default"]({
            generateScopedName: options.mode === "production" ? "[hash:base64:5]" : "[name]__[local]__[hash:base64:5]",
            getJSON: function (_, json) {
              exports = json;
            },
            async resolve(id, importer) {
              let resolvedPath = (await build.resolve(id, {
                resolveDir: path__default["default"].dirname(importer),
                kind: "require-resolve"
              })).path;

              // Since postcss-modules doesn't add `dependency` messages the
              // way other plugins do, we mark any files that are passed to
              // the `resolve` callback as dependencies of this CSS Module
              fileDependencies.add(resolvedPath);
              return resolvedPath;
            }
          })]).process(fileContents, {
            from: absolutePath,
            to: absolutePath
          });

          // Since we're also running with arbitrary user-defined PostCSS
          // plugins, we need to manage dependencies declared by other plugins
          postcss.populateDependenciesFromMessages({
            messages,
            fileDependencies,
            globDependencies
          });
          let compiledJsWithoutCssImport = `export default ${JSON.stringify(exports)};`;

          // Each .module.css file ultimately resolves as a JS file that imports
          // a virtual CSS file containing the compiled CSS, and exports the
          // object that maps local names to generated class names. The compiled
          // CSS file contents are passed to the virtual CSS file via pluginData.
          let compiledJsWithCssImport = [`import "./${path__default["default"].basename(absolutePath)}${compiledCssQuery}";`, compiledJsWithoutCssImport].join("\n");
          return {
            cacheValue: {
              // We need to cache both variants of the compiled JS since the
              // cache is shared between different builds. This allows each
              // build to ask for the JS variant it needs without needing to
              // generate its own custom JS on every build.
              compiledJsWithCssImport,
              compiledJsWithoutCssImport,
              compiledCss
            },
            fileDependencies
          };
        });
        let {
          compiledJsWithCssImport,
          compiledJsWithoutCssImport,
          compiledCss
        } = cacheValue;
        let pluginData = {
          resolveDir,
          compiledCss
        };
        return {
          contents: outputCss ? compiledJsWithCssImport : compiledJsWithoutCssImport,
          loader: "js",
          pluginData
        };
      });
      build.onResolve({
        filter: compiledCssFilter
      }, async args => {
        let pluginData = args.pluginData;
        let absolutePath = path__default["default"].resolve(args.resolveDir, args.path);
        return {
          namespace,
          path: path__default["default"].relative(config.rootDirectory, absolutePath),
          pluginData
        };
      });
      build.onLoad({
        filter: compiledCssFilter,
        namespace
      }, async args => {
        let pluginData = args.pluginData;
        let {
          resolveDir,
          compiledCss
        } = pluginData;
        return {
          resolveDir,
          contents: compiledCss,
          loader: "css"
        };
      });
    }
  };
};

exports.cssModulesPlugin = cssModulesPlugin;
