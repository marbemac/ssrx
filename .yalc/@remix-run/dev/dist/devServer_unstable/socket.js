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

var WebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

let serve = server => {
  let wss = new WebSocket__default["default"].Server({
    server
  });
  let broadcast = message => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket__default["default"].OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
  let log = messageText => {
    let _message = `[remix] ${messageText}`;
    broadcast({
      type: "LOG",
      message: _message
    });
  };
  let reload = () => broadcast({
    type: "RELOAD"
  });
  let hmr = (assetsManifest, updates) => {
    broadcast({
      type: "HMR",
      assetsManifest,
      updates
    });
  };
  let heartbeat = setInterval(broadcast, 60000, {
    type: "PING"
  });
  let close = () => {
    clearInterval(heartbeat);
    return wss.close();
  };
  return {
    log,
    reload,
    hmr,
    close
  };
};

exports.serve = serve;
