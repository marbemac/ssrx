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

var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

function getPackageDependencies(packageJsonFile, includeDev) {
  let pkg = JSON.parse(fs__namespace.readFileSync(packageJsonFile, "utf8"));
  let deps = (pkg === null || pkg === void 0 ? void 0 : pkg.dependencies) || {};
  if (includeDev) {
    Object.assign(deps, (pkg === null || pkg === void 0 ? void 0 : pkg.devDependencies) || {});
  }
  return deps;
}
function getAppDependencies(config, includeDev) {
  return getPackageDependencies(path__namespace.resolve(config.rootDirectory, "package.json"), includeDev);
}
function getDependenciesToBundle(...pkg) {
  let aggregatedDeps = new Set(pkg);
  let visitedPackages = new Set();
  pkg.forEach(p => {
    getPackageDependenciesRecursive(p, aggregatedDeps, visitedPackages);
  });
  return Array.from(aggregatedDeps);
}
function isErrorWithCode(error) {
  return error instanceof Error && typeof error.code === "string";
}
function getPackageDependenciesRecursive(pkg, aggregatedDeps, visitedPackages) {
  visitedPackages.add(pkg);
  let pkgPath;
  try {
    pkgPath = require.resolve(pkg);
  } catch (err) {
    if (isErrorWithCode(err) && err.code === "ERR_PACKAGE_PATH_NOT_EXPORTED") {
      // Handle packages without main exports.
      // They at least need to have package.json exported.
      pkgPath = require.resolve(`${pkg}/package.json`);
    } else {
      throw err;
    }
  }
  let lastIndexOfPackageName = pkgPath.lastIndexOf(pkg);
  if (lastIndexOfPackageName !== -1) {
    pkgPath = pkgPath.substring(0, lastIndexOfPackageName);
  }
  let pkgJson = path__namespace.join(pkgPath, "package.json");
  if (!fs__namespace.existsSync(pkgJson)) {
    console.log(pkgJson, `does not exist`);
    return;
  }
  let dependencies = getPackageDependencies(pkgJson);
  Object.keys(dependencies).forEach(dep => {
    aggregatedDeps.add(dep);
    if (!visitedPackages.has(dep)) {
      getPackageDependenciesRecursive(dep, aggregatedDeps, visitedPackages);
    }
  });
}

exports.getAppDependencies = getAppDependencies;
exports.getDependenciesToBundle = getDependenciesToBundle;
