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

var pc = require('picocolors');
var format = require('./format.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);

let log = ({
  label,
  color,
  dest
}) => {
  let _format = format.format({
    label,
    color
  });
  let already = new Set();
  return (message, {
    details,
    key
  } = {}) => {
    let formatted = _format(message, details) + "\n";
    if (key === undefined) return dest.write(formatted);
    if (already.has(key)) return;
    already.add(key);
    dest.write(formatted);
  };
};
let logger = {
  debug: log({
    label: "debug",
    color: pc__default["default"].green,
    dest: process.stdout
  }),
  info: log({
    label: "info",
    color: pc__default["default"].blue,
    dest: process.stdout
  }),
  warn: log({
    label: "warn",
    color: pc__default["default"].yellow,
    dest: process.stderr
  }),
  error: log({
    label: "error",
    color: pc__default["default"].red,
    dest: process.stderr
  })
};

exports.logger = logger;
