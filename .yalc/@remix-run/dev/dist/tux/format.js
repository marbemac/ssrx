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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);

let format = ({
  label,
  color
}) => (message, details = []) => {
  let lines = [];
  lines.push((pc__default["default"].isColorSupported ? pc__default["default"].inverse(color(` ${label} `)) : `[${label}]`) + " " + message);
  if (details.length > 0) {
    for (let detail of details) {
      lines.push(color("┃") + " " + pc__default["default"].gray(detail));
    }
    lines.push(color("┗"));
  }
  return lines.join("\n");
};

exports.format = format;
