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

let hmrPlugin = ({
  config
}) => {
  return {
    name: "remix-hmr",
    setup: async build => {
      let cache = new Map();
      build.onResolve({
        filter: /^remix:hmr$/
      }, args => {
        return {
          namespace: "hmr-runtime",
          path: args.path
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: "hmr-runtime"
      }, () => {
        let reactRefreshRuntime = require.resolve("react-refresh/runtime").replace(/\\/g, "/");
        let contents = `
import RefreshRuntime from "${reactRefreshRuntime}";

declare global {
  interface Window {
    $RefreshReg$: any;
    $RefreshSig$: any;
  }
}

var prevRefreshReg = window.$RefreshReg$;
var prevRefreshSig = window.$RefreshSig$;

window.$RefreshReg$ = (type, id) => {
  const fullId = id;
  RefreshRuntime.register(type, fullId);
};
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
window.$RefreshRuntime$ = RefreshRuntime;

window.$RefreshRuntime$.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;

if (!window.__hmr__) {
  window.__hmr__ = {
    contexts: {},
  };
}

export function createHotContext(id: string): ImportMetaHot {
  let callback: undefined | ((mod: ModuleNamespace) => void);
  let disposed = false;

  let hot = {
    accept: (dep, cb) => {
      if (typeof dep !== "string") {
        cb = dep;
        dep = undefined;
      }
      if (dep) {
        if (window.__hmr__.contexts[dep]) {
          window.__hmr__.contexts[dep].dispose();
        }
        window.__hmr__.contexts[dep] = createHotContext(dep);
        window.__hmr__.contexts[dep].accept(cb);
        return;
      }
      if (disposed) {
        throw new Error("import.meta.hot.accept() called after dispose()");
      }
      if (callback) {
        throw new Error("import.meta.hot.accept() already called");
      }
      callback = cb;
    },
    dispose: () => {
      disposed = true;
    },
    emit(self: ModuleNamespace) {
      if (callback) {
        callback(self);
        return true;
      }
      return false;
    },
  };

  if (window.__hmr__.contexts[id]) {
    window.__hmr__.contexts[id].dispose();
  }
  window.__hmr__.contexts[id] = hot;

  return hot;
}

declare global {
  interface Window {
    __hmr__: any;
  }
}
        `;
        return {
          loader: "ts",
          contents,
          resolveDir: config.appDirectory
        };
      });
      build.onLoad({
        filter: /.*/,
        namespace: "file"
      }, async args => {
        if (!args.path.match(/@remix-run[/\\]react[/\\]dist[/\\]esm[/\\]browser.js$/) && !args.path.match(/react-router[-dom]?[/\\]$/) && (!args.path.match(/\.[tj]sx?$/) || !fs__namespace.existsSync(args.path) || !args.path.startsWith(config.appDirectory))) {
          return undefined;
        }
        let sourceCode = fs__namespace.readFileSync(args.path, "utf8");
        let value = cache.get(args.path);
        if (!value || value.sourceCode !== sourceCode) {
          let resultCode = await applyHMR(sourceCode, args, config, !!build.initialOptions.sourcemap, args.path.startsWith(config.appDirectory) ? fs__namespace.statSync(args.path).mtimeMs : undefined);
          value = {
            sourceCode,
            output: {
              contents: resultCode,
              loader: args.path.endsWith(".ts") ? "ts" : "tsx",
              resolveDir: path__namespace.dirname(args.path)
            }
          };
          cache.set(args.path, value);
        }
        return value.output;
      });
    }
  };
};
async function applyHMR(sourceCode, args, remixConfig, sourcemap, lastModified) {
  let babel = await import('@babel/core');
  // @ts-expect-error
  let babelPresetTypescript = await import('@babel/preset-typescript');
  // @ts-expect-error
  let babelJsx = await import('@babel/plugin-syntax-jsx');
  // @ts-expect-error
  let reactRefresh = await import('react-refresh/babel');
  // @ts-expect-error
  let babelDecorators = await import('@babel/plugin-syntax-decorators');
  let IS_FAST_REFRESH_ENABLED = /\$RefreshReg\$\(/;

  // add import.meta.hot to the module
  let argsPath = args.path;
  let hmrId = JSON.stringify(path__namespace.relative(remixConfig.rootDirectory, argsPath));
  let hmrPrefix = `import * as __hmr__ from "remix:hmr";
if (import.meta) {
import.meta.hot = __hmr__.createHotContext(
//@ts-expect-error
$id$
);
${lastModified ? `import.meta.hot.lastModified = "${lastModified}";` : ""}
}
// REMIX HMR END
\n`.replace(/\$id\$/g, hmrId);
  let sourceCodeWithHMR = hmrPrefix + sourceCode;

  // run babel to add react-refresh
  let transformResult = babel.transformSync(sourceCodeWithHMR, {
    filename: argsPath,
    ast: false,
    compact: false,
    sourceMaps: sourcemap,
    configFile: false,
    babelrc: false,
    presets: [babelPresetTypescript.default],
    plugins: [[babelDecorators.default, {
      legacy: true
    }], babelJsx.default, [reactRefresh.default, {
      skipEnvCheck: true
    }]]
  });
  let jsWithReactRefresh = (transformResult === null || transformResult === void 0 ? void 0 : transformResult.code) ?? sourceCodeWithHMR;

  // auto opt-in to accepting fast refresh updates if the module
  // has react components
  if (!IS_FAST_REFRESH_ENABLED.test(jsWithReactRefresh)) {
    return "// REMIX HMR BEGIN\n" + sourceCodeWithHMR;
  }
  return `// REMIX HMR BEGIN
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn('remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.');
} else {
  var prevRefreshReg = window.$RefreshReg$;
  var prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, ${JSON.stringify(hmrId)} + id);
  }
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}\n` + jsWithReactRefresh + `\n
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;`;
}

exports.applyHMR = applyHMR;
exports.hmrPlugin = hmrPlugin;
