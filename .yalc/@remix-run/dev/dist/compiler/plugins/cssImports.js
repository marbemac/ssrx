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
var esbuild = require('esbuild');
var invariant = require('../../invariant.js');
var postcss = require('../utils/postcss.js');
var absoluteCssUrlsPlugin = require('./absoluteCssUrlsPlugin.js');

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
var esbuild__default = /*#__PURE__*/_interopDefaultLegacy(esbuild);

const isExtendedLengthPath = /^\\\\\?\\/;
function normalizePathSlashes(p) {
  return isExtendedLengthPath.test(p) ? p : p.replace(/\\/g, "/");
}

/**
 * This plugin loads css files with the "css" loader (bundles and moves assets to assets directory)
 * and exports the url of the css file as its default export.
 */
function cssFilePlugin(ctx) {
  return {
    name: "css-file",
    async setup(build) {
      let {
        absWorkingDir,
        assetNames,
        chunkNames,
        conditions,
        define,
        external,
        sourceRoot,
        treeShaking,
        tsconfig,
        format,
        loader,
        mainFields,
        nodePaths,
        platform,
        publicPath,
        target
      } = build.initialOptions;
      build.onLoad({
        filter: /\.css$/
      }, async args => {
        let cacheKey = `css-file:${args.path}`;
        let {
          cacheValue: {
            contents,
            watchFiles,
            warnings,
            outputFilesWithoutEntry
          }
        } = await ctx.fileWatchCache.getOrSet(cacheKey, async () => {
          let fileDependencies = new Set([args.path]);
          let globDependencies = new Set();

          // eslint-disable-next-line prefer-let/prefer-let -- Avoid needing to repeatedly check for null since const can't be reassigned
          const postcssProcessor = await postcss.getPostcssProcessor(ctx);
          let {
            metafile,
            outputFiles,
            warnings,
            errors
          } = await esbuild__default["default"].build({
            absWorkingDir,
            assetNames,
            chunkNames,
            conditions,
            define,
            external,
            format,
            mainFields,
            nodePaths,
            platform,
            publicPath,
            sourceRoot,
            target,
            treeShaking,
            tsconfig,
            minify: ctx.options.mode === "production",
            bundle: true,
            minifySyntax: true,
            metafile: true,
            write: false,
            sourcemap: Boolean(ctx.options.sourcemap && postcssProcessor),
            // We only need source maps if we're processing the CSS with PostCSS
            splitting: false,
            outdir: ctx.config.assetsBuildDirectory,
            entryNames: assetNames,
            entryPoints: [args.path],
            loader: {
              ...loader,
              ".css": "css"
            },
            plugins: [absoluteCssUrlsPlugin.absoluteCssUrlsPlugin(), ...(postcssProcessor ? [{
              name: "postcss-plugin",
              async setup(build) {
                build.onLoad({
                  filter: /\.css$/,
                  namespace: "file"
                }, async args => {
                  let contents = await fse__default["default"].readFile(args.path, "utf-8");
                  let {
                    css,
                    messages
                  } = await postcssProcessor.process(contents, {
                    from: args.path,
                    to: args.path,
                    map: ctx.options.sourcemap
                  });
                  postcss.populateDependenciesFromMessages({
                    messages,
                    fileDependencies,
                    globDependencies
                  });
                  return {
                    contents: css,
                    loader: "css"
                  };
                });
              }
            }] : [])]
          });
          if (errors && errors.length) {
            throw {
              errors
            };
          }
          invariant["default"](metafile, "metafile is missing");
          let {
            outputs
          } = metafile;
          let entry = Object.keys(outputs).find(out => outputs[out].entryPoint);
          invariant["default"](entry, "entry point not found");
          let normalizedEntry = path__namespace.resolve(ctx.config.rootDirectory, normalizePathSlashes(entry));
          let entryFile = outputFiles.find(file => {
            return path__namespace.resolve(ctx.config.rootDirectory, normalizePathSlashes(file.path)) === normalizedEntry;
          });
          invariant["default"](entryFile, "entry file not found");
          let outputFilesWithoutEntry = outputFiles.filter(file => file !== entryFile);

          // add all css assets to dependencies
          for (let {
            inputs
          } of Object.values(outputs)) {
            for (let input of Object.keys(inputs)) {
              let resolvedInput = path__namespace.resolve(input);
              fileDependencies.add(resolvedInput);
            }
          }
          return {
            cacheValue: {
              contents: entryFile.contents,
              // add all dependencies to watchFiles
              watchFiles: Array.from(fileDependencies),
              warnings,
              outputFilesWithoutEntry
            },
            fileDependencies,
            globDependencies
          };
        });

        // write all assets
        await Promise.all(outputFilesWithoutEntry.map(({
          path: filepath,
          contents
        }) => fse__default["default"].outputFile(filepath, contents)));
        return {
          contents,
          loader: "file",
          watchFiles,
          warnings
        };
      });
    }
  };
}

exports.cssFilePlugin = cssFilePlugin;
