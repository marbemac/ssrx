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

var picomatch = require('picomatch');
var path = require('node:path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var picomatch__default = /*#__PURE__*/_interopDefaultLegacy(picomatch);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

const globMatchers = new Map();
function getGlobMatcher(glob) {
  let matcher = globMatchers.get(glob);
  if (!matcher) {
    matcher = picomatch__default["default"](normalizeSlashes(glob));
    globMatchers.set(glob, matcher);
  }
  return matcher;
}
function createFileWatchCache() {
  let promiseForCacheKey = new Map();
  let fileDepsForCacheKey = new Map();
  let cacheKeysForFileDep = new Map();

  // Glob dependencies are primarily here to support Tailwind.
  // Tailwind directives like `@tailwind utilities` output a bunch of
  // CSS that changes based on the usage of class names in any file matching
  // the globs specified in the `content` array in the Tailwind config, so
  // those globs become a dependency of any CSS file using these directives.
  let globDepsForCacheKey = new Map();
  let cacheKeysForGlobDep = new Map();
  function invalidateCacheKey(invalidatedCacheKey) {
    // If it's not a cache key (or doesn't have a cache entry), bail out
    if (!promiseForCacheKey.has(invalidatedCacheKey)) {
      return;
    }
    promiseForCacheKey.delete(invalidatedCacheKey);

    // Since we keep track of the mapping between cache key and file
    // dependencies, we clear all references to the invalidated cache key.
    // These will be repopulated when "set" or "getOrSet" are called.
    let fileDeps = fileDepsForCacheKey.get(invalidatedCacheKey);
    if (fileDeps) {
      for (let fileDep of fileDeps) {
        var _cacheKeysForFileDep$;
        (_cacheKeysForFileDep$ = cacheKeysForFileDep.get(fileDep)) === null || _cacheKeysForFileDep$ === void 0 ? void 0 : _cacheKeysForFileDep$.delete(invalidatedCacheKey);
      }
      fileDepsForCacheKey.delete(invalidatedCacheKey);
    }

    // Since we keep track of the mapping between cache key and glob
    // dependencies, we clear all references to the invalidated cache key.
    // These will be repopulated when "set" or "getOrSet" are called.
    let globDeps = globDepsForCacheKey.get(invalidatedCacheKey);
    if (globDeps) {
      for (let glob of globDeps) {
        var _cacheKeysForGlobDep$;
        (_cacheKeysForGlobDep$ = cacheKeysForGlobDep.get(glob)) === null || _cacheKeysForGlobDep$ === void 0 ? void 0 : _cacheKeysForGlobDep$.delete(invalidatedCacheKey);
      }
      globDepsForCacheKey.delete(invalidatedCacheKey);
    }
  }
  function invalidateFile(invalidatedFile) {
    // Invalidate all cache entries that depend on the file.
    let cacheKeys = cacheKeysForFileDep.get(invalidatedFile);
    if (cacheKeys) {
      for (let cacheKey of cacheKeys) {
        invalidateCacheKey(cacheKey);
      }
    }

    // Invalidate all cache entries that depend on a glob that matches the file.
    // Any glob could match the file, so we have to check all globs.
    for (let [glob, cacheKeys] of cacheKeysForGlobDep) {
      let match = getGlobMatcher(glob);
      if (match && match(normalizeSlashes(invalidatedFile))) {
        for (let cacheKey of cacheKeys) {
          invalidateCacheKey(cacheKey);
        }
      }
    }
  }
  function get(key) {
    return promiseForCacheKey.get(key);
  }
  function set(key, promise) {
    promiseForCacheKey.set(key, promise);
    void promise.catch(() => {
      // Swallow errors to prevent the build from crashing and remove the
      // rejected promise from the cache so consumers can retry
      if (promiseForCacheKey.get(key) === promise) {
        promiseForCacheKey.delete(key);
      }
      return null;
    }).then(promiseValue => {
      // If the promise was rejected, don't attempt to track dependencies
      if (promiseValue === null) {
        return;
      }
      if (promiseForCacheKey.get(key) !== promise) {
        // This cache key was invalidated before the promise resolved
        // so we don't want to track the dependencies.
        return;
      }
      let {
        fileDependencies,
        globDependencies
      } = promiseValue;

      // Track all file dependencies for this entry point so we can invalidate
      // all cache entries that depend on a file that was invalidated.
      if (fileDependencies) {
        let fileDeps = fileDepsForCacheKey.get(key);
        if (!fileDeps) {
          fileDeps = new Set();
          fileDepsForCacheKey.set(key, fileDeps);
        }
        for (let fileDep of fileDependencies) {
          fileDeps.add(fileDep);
          let cacheKeys = cacheKeysForFileDep.get(fileDep);
          if (!cacheKeys) {
            cacheKeys = new Set();
            cacheKeysForFileDep.set(fileDep, cacheKeys);
          }
          cacheKeys.add(key);
        }
      }

      // Track all glob dependencies for this entry point so we can invalidate
      // all cache entries that depend on a glob that matches the invalided file.
      if (globDependencies) {
        let globDeps = globDepsForCacheKey.get(key);
        if (!globDeps) {
          globDeps = new Set();
          globDepsForCacheKey.set(key, globDeps);
        }
        for (let glob of globDependencies) {
          globDeps.add(glob);
          let cacheKeys = cacheKeysForGlobDep.get(glob);
          if (!cacheKeys) {
            cacheKeys = new Set();
            cacheKeysForGlobDep.set(glob, cacheKeys);
          }
          cacheKeys.add(key);
        }
      }
    });
    return promise;
  }
  function getOrSet(key, lazySetter) {
    return promiseForCacheKey.get(key) || set(key, lazySetter());
  }
  return {
    get,
    set,
    getOrSet,
    invalidateFile
  };
}
function normalizeSlashes(file) {
  return file.split(path__default["default"].win32.sep).join("/");
}

exports.createFileWatchCache = createFileWatchCache;
