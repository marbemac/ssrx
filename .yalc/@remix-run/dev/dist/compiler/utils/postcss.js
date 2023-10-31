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
var node_url = require('node:url');
var fse = require('fs-extra');
var loadConfig = require('postcss-load-config');
var postcss = require('postcss');
var config = require('../../config.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var loadConfig__default = /*#__PURE__*/_interopDefaultLegacy(loadConfig);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

const defaultPostcssContext = {
  vanillaExtract: false
};
function isPostcssEnabled(config) {
  return config.postcss || config.tailwind;
}
function getCacheKey({
  config,
  postcssContext
}) {
  return [config.rootDirectory, postcssContext.vanillaExtract].join("|");
}
let pluginsCache = new Map();
async function loadPostcssPlugins({
  config,
  postcssContext = defaultPostcssContext
}) {
  if (!isPostcssEnabled(config)) {
    return [];
  }
  let {
    rootDirectory
  } = config;
  let cacheKey = getCacheKey({
    config,
    postcssContext
  });
  let cachedPlugins = pluginsCache.get(cacheKey);
  if (cachedPlugins) {
    return cachedPlugins;
  }
  let plugins = [];
  if (config.postcss) {
    try {
      let postcssConfig = await loadConfig__default["default"](
      // We're nesting our custom context values in a "remix"
      // namespace to avoid clashing with other tools.
      {
        remix: postcssContext
      },
      // Custom config extensions aren't type safe
      rootDirectory);
      plugins.push(...postcssConfig.plugins);
    } catch (err) {
      // If they don't have a PostCSS config, just ignore it,
      // otherwise rethrow the error.
      if (err instanceof Error && !/No PostCSS Config found/i.test(err.message)) {
        throw err;
      }
    }
  }
  if (config.tailwind) {
    let tailwindPlugin = await loadTailwindPlugin(config);
    if (tailwindPlugin && !hasTailwindPlugin(plugins, tailwindPlugin)) {
      plugins.push(tailwindPlugin);
    }
  }
  pluginsCache.set(cacheKey, plugins);
  return plugins;
}
let processorCache = new Map();
async function getPostcssProcessor({
  config,
  postcssContext = defaultPostcssContext
}) {
  if (!isPostcssEnabled(config)) {
    return null;
  }
  let cacheKey = getCacheKey({
    config,
    postcssContext
  });
  let cachedProcessor = processorCache.get(cacheKey);
  if (cachedProcessor !== undefined) {
    return cachedProcessor;
  }
  let plugins = await loadPostcssPlugins({
    config,
    postcssContext
  });
  let processor = plugins.length > 0 ? postcss__default["default"](plugins) : null;
  processorCache.set(cacheKey, processor);
  return processor;
}
function hasTailwindPlugin(plugins, tailwindPlugin) {
  return plugins.some(plugin => plugin === tailwindPlugin || typeof plugin === "function" && plugin.name === "tailwindcss" || "postcssPlugin" in plugin && plugin.postcssPlugin === "tailwindcss");
}
let tailwindPluginCache = new Map();
async function loadTailwindPlugin(config$1) {
  var _await$import;
  if (!config$1.tailwind) {
    return null;
  }
  let {
    rootDirectory
  } = config$1;
  let cacheKey = rootDirectory;
  let cachedTailwindPlugin = tailwindPluginCache.get(cacheKey);
  if (cachedTailwindPlugin !== undefined) {
    return cachedTailwindPlugin;
  }
  let tailwindPath = null;
  try {
    // First ensure they have a Tailwind config
    let tailwindConfigExtensions = [".js", ".cjs", ".mjs", ".ts"];
    let tailwindConfig = config.findConfig(rootDirectory, "tailwind.config", tailwindConfigExtensions);
    if (!tailwindConfig) throw new Error("No Tailwind config found");

    // Load Tailwind from the project directory
    tailwindPath = require.resolve("tailwindcss", {
      paths: [rootDirectory]
    });
  } catch {
    // If they don't have a Tailwind config or Tailwind installed, just ignore it.
    return null;
  }
  let importedTailwindPlugin = tailwindPath ? (_await$import = await import(node_url.pathToFileURL(tailwindPath).href)) === null || _await$import === void 0 ? void 0 : _await$import.default : null;
  let tailwindPlugin = importedTailwindPlugin && importedTailwindPlugin.postcss // Check that it declares itself as a PostCSS plugin
  ? importedTailwindPlugin : null;
  tailwindPluginCache.set(cacheKey, tailwindPlugin);
  return tailwindPlugin;
}

// PostCSS plugin result objects can contain arbitrary messages returned
// from plugins. Here we look for messages that indicate a dependency
// on another file or glob. Here we target the generic dependency messages
// returned from 'postcss-import' and 'tailwindcss' plugins, but we may
// need to add more in the future depending on what other plugins do.
// More info:
// - https://postcss.org/docs/postcss-runner-guidelines
// - https://postcss.org/api/#result
// - https://postcss.org/api/#message
function populateDependenciesFromMessages({
  messages,
  fileDependencies,
  globDependencies
}) {
  for (let message of messages) {
    if (message.type === "dependency" && typeof message.file === "string") {
      fileDependencies.add(message.file);
      continue;
    }
    if (message.type === "dir-dependency" && typeof message.dir === "string" && typeof message.glob === "string") {
      globDependencies.add(path__default["default"].join(message.dir, message.glob));
      continue;
    }
  }
}
async function getCachedPostcssProcessor({
  config,
  options,
  fileWatchCache
}) {
  // eslint-disable-next-line prefer-let/prefer-let -- Avoid needing to repeatedly check for null since const can't be reassigned
  const postcssProcessor = await getPostcssProcessor({
    config
  });
  if (!postcssProcessor) {
    return null;
  }
  return async function processCss(args) {
    let cacheKey = `postcss:${args.path}?sourcemap=${options.sourcemap}`;
    let {
      cacheValue
    } = await fileWatchCache.getOrSet(cacheKey, async () => {
      let contents = await fse__default["default"].readFile(args.path, "utf-8");
      let {
        css,
        messages
      } = await postcssProcessor.process(contents, {
        from: args.path,
        to: args.path,
        map: options.sourcemap
      });
      let fileDependencies = new Set();
      let globDependencies = new Set();

      // Ensure the CSS file being passed to PostCSS is tracked as a
      // dependency of this cache key since a change to this file should
      // invalidate the cache, not just its sub-dependencies.
      fileDependencies.add(args.path);
      populateDependenciesFromMessages({
        messages,
        fileDependencies,
        globDependencies
      });
      return {
        cacheValue: css,
        fileDependencies,
        globDependencies
      };
    });
    return cacheValue;
  };
}

exports.getCachedPostcssProcessor = getCachedPostcssProcessor;
exports.getPostcssProcessor = getPostcssProcessor;
exports.loadPostcssPlugins = loadPostcssPlugins;
exports.populateDependenciesFromMessages = populateDependenciesFromMessages;
