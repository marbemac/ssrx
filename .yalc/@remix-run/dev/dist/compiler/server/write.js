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

async function write(config, outputFiles) {
  await fse__default["default"].ensureDir(path__namespace.dirname(config.serverBuildPath));
  for (let file of outputFiles) {
    if ([".js", ".cjs", ".mjs"].some(ext => file.path.endsWith(ext))) {
      // fix sourceMappingURL to be relative to current path instead of /build
      let filename = file.path.substring(file.path.lastIndexOf(path__namespace.sep) + 1);
      let escapedFilename = filename.replace(/([.[\]])/g, "\\$1");
      let pattern = `(//# sourceMappingURL=)(.*)${escapedFilename}`;
      let contents = Buffer.from(file.contents).toString("utf-8");
      contents = contents.replace(new RegExp(pattern), `$1${filename}`);
      await fse__default["default"].writeFile(file.path, contents);
    } else if (file.path.endsWith(".map")) {
      // Don't write CSS source maps to server build output
      if (file.path.endsWith(".css.map")) {
        break;
      }

      // remove route: prefix from source filenames so breakpoints work
      let contents = Buffer.from(file.contents).toString("utf-8");
      contents = contents.replace(/"route:/gm, '"');
      await fse__default["default"].writeFile(file.path, contents);
    } else {
      let assetPath = path__namespace.join(config.assetsBuildDirectory, file.path.replace(path__namespace.dirname(config.serverBuildPath), ""));

      // Don't write CSS bundle from server build to browser assets directory,
      // especially since the file name doesn't contain a content hash
      if (assetPath === path__namespace.join(config.assetsBuildDirectory, "index.css")) {
        break;
      }
      await fse__default["default"].ensureDir(path__namespace.dirname(assetPath));
      await fse__default["default"].writeFile(assetPath, file.contents);
    }
  }
}

exports.write = write;
