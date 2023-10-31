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

var vmod = require('./vmod.js');

// This file allows us to dynamically require the plugin so non-Vite consumers
const unstable_vitePlugin = (...args) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let {
    remixVitePlugin
  } = require("./plugin");
  return remixVitePlugin(...args);
};
const unstable_createViteServer = async () => {
  let vite = await import('vite');
  return vite.createServer({
    server: {
      middlewareMode: true
    }
  });
};
const unstable_loadViteServerBuild = async vite => {
  return vite.ssrLoadModule(vmod.id("server-entry"));
};

exports.unstable_createViteServer = unstable_createViteServer;
exports.unstable_loadViteServerBuild = unstable_loadViteServerBuild;
exports.unstable_vitePlugin = unstable_vitePlugin;
