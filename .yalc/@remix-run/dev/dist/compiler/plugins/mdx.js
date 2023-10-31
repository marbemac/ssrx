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

var fs = require('node:fs');
var path = require('node:path');
var remarkMdxFrontmatter = require('remark-mdx-frontmatter');
var loaders = require('../utils/loaders.js');
var tsconfig = require('../utils/tsconfig.js');

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

function mdxPlugin({
  config
}) {
  return {
    name: "remix-mdx",
    async setup(build) {
      let [mdx, {
        default: remarkFrontmatter
      }] = await Promise.all([import('@mdx-js/mdx'), import('remark-frontmatter')]);
      build.onResolve({
        filter: /\.mdx?$/
      }, args => {
        let matchPath = tsconfig.createMatchPath(config.tsconfigPath);
        // Resolve paths according to tsconfig paths property
        function resolvePath(id) {
          if (!matchPath) {
            return id;
          }
          return matchPath(id, undefined, undefined, [".ts", ".tsx", ".js", ".jsx", ".mdx", ".md"]) || id;
        }
        let resolvedPath = resolvePath(args.path);
        let resolved = path__namespace.resolve(args.resolveDir, resolvedPath);
        return {
          path: path__namespace.relative(config.appDirectory, resolved),
          namespace: "mdx"
        };
      });
      build.onLoad({
        filter: /\.mdx?$/
      }, async args => {
        let absolutePath = path__namespace.join(config.appDirectory, args.path);
        return processMDX(mdx, remarkFrontmatter, config, args.path, absolutePath);
      });
    }
  };
}
async function processMDX(
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
mdx,
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
remarkFrontmatter, config, argsPath, absolutePath) {
  try {
    let fileContents = await fs.promises.readFile(absolutePath, "utf-8");
    let rehypePlugins = [];
    let remarkPlugins = [remarkFrontmatter, [remarkMdxFrontmatter.remarkMdxFrontmatter, {
      name: "attributes"
    }]];
    switch (typeof config.mdx) {
      case "object":
        rehypePlugins.push(...(config.mdx.rehypePlugins || []));
        remarkPlugins.push(...(config.mdx.remarkPlugins || []));
        break;
      case "function":
        let mdxConfig = await config.mdx(argsPath);
        rehypePlugins.push(...((mdxConfig === null || mdxConfig === void 0 ? void 0 : mdxConfig.rehypePlugins) || []));
        remarkPlugins.push(...((mdxConfig === null || mdxConfig === void 0 ? void 0 : mdxConfig.remarkPlugins) || []));
        break;
    }
    let remixExports = `
export const filename = ${JSON.stringify(path__namespace.basename(argsPath))};
export const headers = typeof attributes !== "undefined" && attributes.headers;
export const meta = typeof attributes !== "undefined" && attributes.meta;
export const handle = typeof attributes !== "undefined" && attributes.handle;
    `;
    let compiled = await mdx.compile(fileContents, {
      jsx: true,
      jsxRuntime: "automatic",
      rehypePlugins,
      remarkPlugins
    });
    let contents = `
${compiled.value}
${remixExports}`;
    let errors = [];
    let warnings = [];
    compiled.messages.forEach(message => {
      let toPush = message.fatal ? errors : warnings;
      toPush.push({
        location: message.line || message.column ? {
          column: typeof message.column === "number" ? message.column : undefined,
          line: typeof message.line === "number" ? message.line : undefined
        } : undefined,
        text: message.message,
        detail: typeof message.note === "string" ? message.note : undefined
      });
    });
    return {
      errors: errors.length ? errors : undefined,
      warnings: warnings.length ? warnings : undefined,
      contents,
      resolveDir: path__namespace.dirname(absolutePath),
      loader: loaders.getLoaderForFile(argsPath)
    };
  } catch (err) {
    return {
      errors: [{
        text: err.message
      }]
    };
  }
}

exports.mdxPlugin = mdxPlugin;
exports.processMDX = processMDX;
