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

var execa = require('execa');
var pidtree = require('pidtree');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var execa__default = /*#__PURE__*/_interopDefaultLegacy(execa);
var pidtree__default = /*#__PURE__*/_interopDefaultLegacy(pidtree);

let isWindows = process.platform === "win32";
let kill = async pid => {
  if (!isAlive(pid)) return;
  if (isWindows) {
    await execa__default["default"]("taskkill", ["/F", "/PID", pid.toString()]).catch(error => {
      // taskkill 128 -> the process is already dead
      if (error.exitCode === 128) return;
      if (/There is no running instance of the task./.test(error.message)) return;
      console.warn(error.message);
    });
    return;
  }
  await execa__default["default"]("kill", ["-9", pid.toString()]).catch(error => {
    // process is already dead
    if (/No such process/.test(error.message)) return;
    console.warn(error.message);
  });
};
let isAlive = pid => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
};
let killtree = async pid => {
  let descendants = await pidtree__default["default"](pid).catch(() => undefined);
  if (descendants === undefined) return;
  let pids = [pid, ...descendants];
  await Promise.all(pids.map(kill));
  return new Promise((resolve, reject) => {
    let check = setInterval(() => {
      pids = pids.filter(isAlive);
      if (pids.length === 0) {
        clearInterval(check);
        resolve();
      }
    }, 50);
    setTimeout(() => {
      clearInterval(check);
      reject(new Error("Timeout: Processes did not exit within the specified time."));
    }, 2000);
  });
};

exports.kill = kill;
exports.killtree = killtree;
