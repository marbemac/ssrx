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

/**
 * A route that was created using `defineRoutes` or created conventionally from
 * looking at the files on the filesystem.
 */

/**
 * A function for defining a route that is passed as the argument to the
 * `defineRoutes` callback.
 *
 * Calls to this function are designed to be nested, using the `children`
 * callback argument.
 *
 *   defineRoutes(route => {
 *     route('/', 'pages/layout', () => {
 *       route('react-router', 'pages/react-router');
 *       route('reach-ui', 'pages/reach-ui');
 *     });
 *   });
 */

/**
 * A function for defining routes programmatically, instead of using the
 * filesystem convention.
 */
function defineRoutes(callback) {
  let routes = Object.create(null);
  let parentRoutes = [];
  let alreadyReturned = false;
  let defineRoute = (path, file, optionsOrChildren, children) => {
    if (alreadyReturned) {
      throw new Error("You tried to define routes asynchronously but started defining " + "routes before the async work was done. Please await all async " + "data before calling `defineRoutes()`");
    }
    let options;
    if (typeof optionsOrChildren === "function") {
      // route(path, file, children)
      options = {};
      children = optionsOrChildren;
    } else {
      // route(path, file, options, children)
      // route(path, file, options)
      options = optionsOrChildren || {};
    }
    let route = {
      path: path ? path : undefined,
      index: options.index ? true : undefined,
      caseSensitive: options.caseSensitive ? true : undefined,
      id: options.id || createRouteId(file),
      parentId: parentRoutes.length > 0 ? parentRoutes[parentRoutes.length - 1].id : "root",
      file
    };
    if (route.id in routes) {
      throw new Error(`Unable to define routes with duplicate route id: "${route.id}"`);
    }
    routes[route.id] = route;
    if (children) {
      parentRoutes.push(route);
      children();
      parentRoutes.pop();
    }
  };
  callback(defineRoute);
  alreadyReturned = true;
  return routes;
}
function createRouteId(file) {
  return normalizeSlashes(stripFileExtension(file));
}
function normalizeSlashes(file) {
  return file.split(path__namespace.win32.sep).join("/");
}
function stripFileExtension(file) {
  return file.replace(/\.[a-z0-9]+$/i, "");
}

exports.createRouteId = createRouteId;
exports.defineRoutes = defineRoutes;
exports.normalizeSlashes = normalizeSlashes;
