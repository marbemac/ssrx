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
var compiler = require('./css/compiler.js');
var bundle = require('./css/bundle.js');
var compiler$1 = require('./js/compiler.js');
var write = require('./js/write.js');
var compiler$2 = require('./server/compiler.js');
var write$1 = require('./server/write.js');
var channel = require('../channel.js');
var manifest = require('./manifest.js');
var lazyValue = require('./lazyValue.js');
var result = require('../result.js');
var cancel = require('./cancel.js');

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

let create = async ctx => {
  // these variables _should_ be scoped to a build, not a compiler
  // but esbuild doesn't have an API for passing build-specific arguments for rebuilds
  // so instead use a mutable reference (`refs`) that is compiler-scoped
  // and gets reset on each build
  let refs = {
    lazyCssBundleHref: undefined,
    manifestChannel: undefined
  };
  let subcompiler = {
    css: await compiler.create(ctx),
    js: await compiler$1.create(ctx, refs),
    server: await compiler$2.create(ctx, refs)
  };
  let cancel$1 = async () => {
    // resolve channels with error so that downstream tasks don't hang waiting for results from upstream tasks
    refs.lazyCssBundleHref.cancel();
    refs.manifestChannel.err();

    // optimization: cancel tasks
    await Promise.all([subcompiler.css.cancel(), subcompiler.js.cancel(), subcompiler.server.cancel()]);
  };
  let compile = async (options = {}) => {
    var _options$onManifest;
    let error = undefined;
    let errCancel = thrown => {
      if (error === undefined) {
        error = thrown;
      }
      void cancel$1();
      return result.err(thrown);
    };

    // keep track of manually written artifacts
    let writes = {};

    // reset refs for this compilation
    refs.manifestChannel = channel.create();
    refs.lazyCssBundleHref = lazyValue.createLazyValue({
      async get() {
        let {
          bundleOutputFile,
          outputFiles
        } = await subcompiler.css.compile();
        if (bundleOutputFile) {
          writes.cssBundle = bundle.write(ctx, outputFiles);
        }
        return bundleOutputFile && ctx.config.publicPath + path__namespace.relative(ctx.config.assetsBuildDirectory, path__namespace.resolve(bundleOutputFile.path));
      },
      onCancel: ({
        reject
      }) => {
        reject(new cancel.Cancel("css-bundle"));
      }
    });

    // kickoff compilations in parallel
    let tasks = {
      js: subcompiler.js.compile().then(result.ok, errCancel),
      server: subcompiler.server.compile().then(result.ok, errCancel)
    };

    // js compilation (implicitly writes artifacts/js)
    let js = await tasks.js;
    if (!js.ok) throw error ?? js.error;
    let {
      metafile,
      outputFiles,
      hmr
    } = js.value;
    writes.js = write.write(ctx.config, outputFiles);

    // artifacts/manifest
    let manifest$1 = await manifest.create({
      config: ctx.config,
      metafile,
      hmr,
      fileWatchCache: ctx.fileWatchCache
    });
    refs.manifestChannel.ok(manifest$1);
    (_options$onManifest = options.onManifest) === null || _options$onManifest === void 0 ? void 0 : _options$onManifest.call(options, manifest$1);
    writes.manifest = manifest.write(ctx.config, manifest$1);

    // server compilation
    let server = await tasks.server;
    if (!server.ok) throw error ?? server.error;
    // artifacts/server
    writes.server = write$1.write(ctx.config, server.value).then(() => {
      // write the version to a sentinel file _after_ the server has been written
      // this allows the app server to watch for changes to `version.txt`
      // avoiding race conditions when the app server would attempt to reload a partially written server build
      let versionTxt = path__namespace.join(path__namespace.dirname(ctx.config.serverBuildPath), "version.txt");
      fs__namespace.writeFileSync(versionTxt, manifest$1.version);
    });
    await Promise.all(Object.values(writes));
    return manifest$1;
  };
  return {
    compile,
    cancel: cancel$1,
    dispose: async () => {
      await Promise.all(Object.values(subcompiler).map(sub => sub.dispose()));
    }
  };
};

exports.create = create;
