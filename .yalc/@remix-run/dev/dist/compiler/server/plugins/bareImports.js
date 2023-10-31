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
var virtualModules = require('../virtualModules.js');
var cssSideEffectImports = require('../../plugins/cssSideEffectImports.js');
var tsconfig = require('../../utils/tsconfig.js');
var loaders = require('../../utils/loaders.js');

/**
 * A plugin responsible for resolving bare module ids based on server target.
 * This includes externalizing for node based platforms, and bundling for single file
 * environments such as cloudflare.
 */
function serverBareModulesPlugin(ctx) {
  // Resolve paths according to tsconfig paths property
  let matchPath = ctx.config.tsconfigPath ? tsconfig.createMatchPath(ctx.config.tsconfigPath) : undefined;
  function resolvePath(id) {
    if (!matchPath) {
      return id;
    }
    return matchPath(id, undefined, undefined, [".ts", ".tsx", ".js", ".jsx"]) || id;
  }
  return {
    name: "server-bare-modules",
    setup(build) {
      build.onResolve({
        filter: /.*/
      }, ({
        importer,
        path
      }) => {
        // If it's not a bare module ID, bundle it.
        if (!isBareModuleId(resolvePath(path))) {
          return undefined;
        }

        // Always bundle @remix-run/css-bundle
        if (path === "@remix-run/css-bundle") {
          return undefined;
        }

        // To prevent `import xxx from "remix"` from ending up in the bundle
        // we "bundle" remix but the other modules where the code lives.
        if (path === "remix") {
          return undefined;
        }

        // These are our virtual modules, always bundle them because there is no
        // "real" file on disk to externalize.
        if (path === virtualModules.serverBuildVirtualModule.id || path === virtualModules.assetsManifestVirtualModule.id) {
          return undefined;
        }

        // Skip assets that are treated as files (.css, .svg, .png, etc.).
        // Otherwise, esbuild would emit code that would attempt to require()
        // or import these files --- which aren't JavaScript!
        let loader;
        try {
          loader = loaders.getLoaderForFile(path);
        } catch (e) {
          if (!(e instanceof Error && e.message.startsWith("Cannot get loader for file"))) {
            throw e;
          }
        }
        if (loader === "file") {
          return undefined;
        }

        // Always bundle CSS side-effect imports.
        if (cssSideEffectImports.isCssSideEffectImportPath(path)) {
          return undefined;
        }
        if (ctx.config.serverDependenciesToBundle === "all") {
          return undefined;
        }
        for (let pattern of ctx.config.serverDependenciesToBundle) {
          // bundle it if the path matches the pattern
          if (typeof pattern === "string" ? path === pattern : pattern.test(path)) {
            return undefined;
          }
        }

        // Externalize everything else if we've gotten here.
        return {
          path,
          external: true
        };
      });
    }
  };
}
function isBareModuleId(id) {
  return !id.startsWith("node:") && !id.startsWith(".") && !path.isAbsolute(id);
}

exports.serverBareModulesPlugin = serverBareModulesPlugin;
